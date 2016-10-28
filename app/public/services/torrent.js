(function () {

    var _ = require('lodash');
    var WebTorrent = require('webtorrent');
    var crypto = require('crypto')
    var ed = require('ed25519-supercop');
    var db = require('./db');

    

    class Torrent {
        constructor() {
            this.client = new WebTorrent({
                dht: {
                    verify: ed.verify
                }
            });
        }


        static getTorrent(infoHash) {
            var client = new WebTorrent();

            var magnetURI = 'magnet:?xt=urn:btih:' + infoHash + '&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';
            console.log(magnetURI);
            var torrent = client.add(magnetURI);
            return torrent.on('done', function () {
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
                            for (var data in temp.profile._attachments) {
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
                            for (var post of temp.posts) {
                                if (!_.some(p.rows, function (row) {
                                        return row.doc.text === post.text
                                    })) {
                                    delete post._rev;
                                    db.putPost(post, temp.profile._id);
                                }
                            }
                        });


                        db.getPhoto(temp.profile._id).then(function (p) {

                            for (var photo of temp.photos) {
                                console.log(photo);
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

        }

        static changeAttachementsToString(data) {
            if (data && data._attachments) {
                for (var fileName in data._attachments) {
                    data._attachments[fileName].data = new Buffer(data._attachments[fileName].data).toString('base64');
                }
            }
        }

        static prepareForTorrent(data) {
            Torrent.changeAttachementsToString(data.profile);
            for (var post of data.posts) {
                Torrent.changeAttachementsToString(post);
            }
            for (var photo of data.photos) {
                Torrent.changeAttachementsToString(photo);
            }
        }

        share() {
            var self = this;
            var data = {};
            db.getUserGuid()
                .then(function (guid) {
                    console.log(guid);
                    let data = db.getAllDocs(guid.value);
                        if (data.profile) {
                            Torrent.prepareForTorrent(data);
                            console.info('Torrent info hash:', data);

                            var fileBuffer = new Buffer(JSON.stringify(data));
                            fileBuffer.name = guid.value;

                            self.client.seed(fileBuffer, {
                                name: guid.value
                            }, function onTorrent(torrent) {
                                // Client is seeding the file!
                                console.info('Torrent info hash:', torrent.magnetURI);
                                Torrent.runPublish(guid.keypair.publicKey, guid.keypair.secretKey, torrent.infoHash)

                            });
                        }

                }).catch(function (err) {
                    console.log(err);
                });

        }


        static runPublish(publicKey, secretKey, infoHash) {
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

        runConsume(publicKey) {
            var buffPubKey = Buffer(publicKey, 'hex')
            var targetID = crypto.createHash('sha1').update(buffPubKey).digest('hex') // XXX missing salt

            var client = new WebTorrent({
                dht: {
                    verify: ed.verify
                }
            })

            var dht = client.dht

            console.log('connecting to DHT... ')
            return dht.on('ready', function () {

                console.log('looking up target ID ' + targetID + ' ... ')

                return dht.get(targetID, function (err, res) {
                    if (err || !res) {
                        console.log('{red:not found}')
                        client.destroy();
                    } else {
                        console.log('response:')

                        var magnetURI = res.v.ih.toString('hex');
                        console.log(magnetURI)
                        client.destroy();

                        console.log();
                        return Torrent.getTorrent(magnetURI);
                    }
                })

            })
        }
    }

    angular.module('myApp').service('Torrent', Torrent);
}())