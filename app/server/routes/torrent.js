var DHT = require('bittorrent-dht')
var _ = require('lodash');
var WebTorrent = require('webtorrent');
var crypto = require('crypto')
var ed = require('ed25519-supercop')
module.exports = function (app, db, client) {

    app.post('/share', function (req, res) {
        console.log(req.body);
        share(res);
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

        var magnetURI = 'magnet:?xt=urn:btih:' + infoHash + '&tr=udp://exodus.desync.com:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.internetwarriors.net:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.openbittorrent.com:80&tr=wss://tracker.btorrent.xyz&tr=wss://tracker.fastcast.nz&tr=wss://tracker.openwebtorrent.com&tr=wss://tracker.webtorrent.io';
        console.log(magnetURI);

        var torrent = client.add(magnetURI);
        torrent.on('done', function () {
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
        if (res) res.json({
            "status": "success"
        });
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
        client.destroy();

        var data = {};
        db.getUserGuid()
            .then(function (guid) {
                console.log(guid);
                db.getAllDocs(guid.value).then(function (data) {
                    if (data.profile) {
                        prepareForTorrent(data);
                        console.log('Torrent info hash:', data);

                        var fileBuffer = new Buffer(JSON.stringify(data));
                        fileBuffer.name = data.profile.full_name;
                        client = new WebTorrent();
                        client.seed(fileBuffer, function onTorrent(torrent) {
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