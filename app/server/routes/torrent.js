var DHT = require('bittorrent-dht')
var _ = require('lodash');
var WebTorrent = require('webtorrent');
var crypto = require('crypto')
var ed = require('ed25519-supercop')
module.exports = function (app, db) {

    app.post('/share', function (req, res) {
        console.log(req.body);
        share(res);
    });

    app.get('/data', function (req, res) {
        var data = {};
        db.getUserGuid()
            .then(function (guid) {
                console.log(guid);
                db.getAllDocs(guid.value).then(function (data) {
                    if (data.profile) {
                        prepareForTorrent(data);
                        console.log('Torrent info hash:', data);

                        res.json(data);
                    } else {
                        res.json(data);
                    }
                });
            });
    });

    app.post('/save_friend', function (req, res) {

        var temp = req.body.data;
        console.log(temp);
        temp.profile._id = "profile_" + temp.profile._id;
        if (temp.profile._attachments) {
            for (data in temp.profile._attachments) {
                temp.profile._attachments[data].data = new Buffer(temp.profile._attachments[data].data, 'base64')
            }
        }
        console.log(temp.profile._id);
        db.db.get(temp.profile._id).then(function (p) {
            temp.profile._rev = p._rev;
            db.db.put(temp.profile);
        }).catch(function () {
            delete temp.profile._rev;
            db.db.put(temp.profile);
        });
        db.getPost(temp.profile._id).then(function (p) {
            for (post of temp.posts) {
                if (!_.some(p.rows, function (row) {
                        return row.doc.text === post.text
                    })) {
                    delete post._rev;
                    db.putPost(post, temp.profile._id);
                }
            }
        });


        db.getPhoto(temp.profile._id).then(function (p) {

            for (photo of temp.photos) {
                console.log(p);
                if (!_.some(p.rows, function (row) {
                        return row.doc.album === photo.album
                    })) {
                    delete photo._rev;
                    db.putPhoto(photo, temp.profile._id);
                }

            }
        })
        if (res) res.json("infoHash")
    });

    app.post('/data/:user_id', function (req, res) {
        var infoHash = req.params.user_id;
        console.log(infoHash);
        db.getUserGuid()
            .then(function (guid) {
                runPublish(guid.keypair.publicKey, guid.keypair.secretKey, infoHash)
                if (res) res.json(infoHash)
            })
    });

    app.post('/upload/:user_id', function (req, res) {
        console.log(req.params.user_id);
        runConsume(req.params.user_id, res);
    });

    return {
        share,
        runConsume
    }

    function getTorrent(infoHash, res) {
        var client = new WebTorrent();

        var magnetURI = 'magnet:?xt=urn:btih:' + infoHash + '&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';
        console.log(magnetURI);
        if (res) res.json(magnetURI);
        /*
        var torrent = client.add(magnetURI);
        torrent.on('done', function () {
            console.log("aaa");
            torrent.files.forEach(function (file) {
                // Get a url for each file
                console.log(file);
                file.getBuffer(function (err, buffer) {
                    if (err) throw err;
                    var temp = JSON.parse(buffer.toString('utf-8'));
                    console.log(temp);
                    temp.profile._id = "profile_" + temp.profile._id;
                    if (temp.profile._attachments) {
                        for (data in temp.profile._attachments) {
                            temp.profile._attachments[data].data = new Buffer(temp.profile._attachments[data].data, 'base64')
                        }
                    }
                    console.log(temp.profile._id);
                    db.db.get(temp.profile._id).then(function (p) {
                        temp.profile._rev = p._rev;
                        db.db.put(temp.profile);
                    }).catch(function () {
                        delete temp.profile._rev;
                        db.db.put(temp.profile);
                    });
                    db.getPost(temp.profile._id).then(function (p) {
                        for (post of temp.posts) {
                            if (!_.some(p.rows, function (row) {
                                    return row.doc.text === post.text
                                })) {
                                delete post._rev;
                                db.putPost(post, temp.profile._id);
                            }
                        }
                    });


                    db.getPhoto(temp.profile._id).then(function (p) {

                        for (photo of temp.photos) {
                            console.log(p);
                            if (!_.some(p.rows, function (row) {
                                    return row.doc.album === photo.album
                                })) {
                                delete photo._rev;
                                db.putPhoto(photo, temp.profile._id);
                            }

                        }
                    })


                    client.destroy();



                });


            });
        })
                */
    }

    function changeAttachementsToString(data) {
        if (data && data._attachments) {
            for (fileName in data._attachments) {
                data._attachments[fileName].data = new Buffer(data._attachments[fileName].data).toString('base64');
            }
        }
    }

    function prepareForTorrent(data) {
        changeAttachementsToString(data.profile);
        for (post of data.posts) {
            changeAttachementsToString(post);
        }
        for (photo of data.photos) {
            changeAttachementsToString(photo);
        }
    }

    function share(res) {

        var data = {};
        db.getUserGuid()
            .then(function (guid) {
                console.log(guid);
                db.getAllDocs(guid.value).then(function (data) {
                    if (data.profile) {
                        prepareForTorrent(data);
                        console.log('Torrent info hash:', data);

                        var fileBuffer = new Buffer(JSON.stringify(data));
                        fileBuffer.name = guid.value;
                        var client = new WebTorrent({
                            dht: {
                                verify: ed.verify
                            }
                        });
                        client.seed(fileBuffer, {
                            name: guid.value
                        }, function onTorrent(torrent) {
                            // Client is seeding the file!
                            console.log('Torrent info hash:', torrent.magnetURI);
                            runPublish(guid.keypair.publicKey, guid.keypair.secretKey, torrent.infoHash)
                            if (res) res.json(torrent.infoHash)

                        });
                    }
                });

            }).catch(function (err) {
                console.log(err);
                if (res) res.json(err);
            });

    }


    function runPublish(publicKey, secretKey, infoHash) {
        var buffPubKey = Buffer(publicKey, 'hex')
        var buffSecKey = Buffer(secretKey, 'hex')
        var targetID = crypto.createHash('sha1').update(buffPubKey).digest('hex') // XXX missing salt

        var client = new WebTorrent({
            dht: {
                verify: ed.verify
            }
        })

        var dht = client.dht

        console.log('connecting to DHT... ')
        dht.on('ready', function () {

            var opts = {
                k: buffPubKey,
                //seq: 0,
                v: {
                    ih: new Buffer(infoHash, 'hex')
                },
                sign: function (buf) {
                    return ed.sign(buf, buffPubKey, buffSecKey)
                }
            }

            console.log('looking up target ID ' + targetID + ' ... ')
            dht.get(targetID, function (err, res) {
                if (err || !res) {
                    console.log('{red:not found}')
                    publishSeq(0)
                } else {
                    console.log('{green:done}')
                    publishSeq(res.seq + 1)
                }

                function publishSeq(seq) {
                    opts.seq = seq
                    console.log('making request:')
                    console.log(opts)
                    dht.put(opts, function (err, hash) {
                        if (err) console.log('{red:error publishing}')
                        if (hash) console.log('{green:done}')
                        client.destroy()
                    })

                }
            })


        })

    }

    function runConsume(publicKey, response) {
        var buffPubKey = Buffer(publicKey, 'hex')
        var targetID = crypto.createHash('sha1').update(buffPubKey).digest('hex') // XXX missing salt

        var client = new WebTorrent({
            dht: {
                verify: ed.verify
            }
        })

        var dht = client.dht

        console.log('connecting to DHT... ')
        dht.on('ready', function () {

            console.log('looking up target ID ' + targetID + ' ... ')

            dht.get(targetID, function (err, res) {
                if (err || !res) {
                    console.log('{red:not found}')
                    if (response) response.json(err)
                    client.destroy();
                } else {
                    console.log('response:')

                    var magnetURI = res.v.ih.toString('hex');
                    console.log(magnetURI)
                    client.destroy();

                    console.log();
                    getTorrent(magnetURI, response);
                }
            })

        })
    }
}