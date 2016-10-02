var DHT = require('bittorrent-dht')

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
        share
    }

    function getTorrent(data, res) {
        var client = new WebTorrent();

        var hash = "magnet:?xt=urn:btih:" + data + "&dn=sfdfsd&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io";
        console.log(hash);

        var torrent = client.add(hash);
        torrent.on('done', function () {
            torrent.files.forEach(function (file) {
                // Get a url for each file
                console.log(file);
                file.getBuffer(function (err, buffer) {
                    if (err) throw err;
                    var temp = JSON.parse(buffer.toString('utf-8'));
                    console.log(temp);
                    var new_user = {
                        _id: "profile_" + temp.profile._id,
                        full_name: temp.profile.full_name,
                        job: temp.profile.job,
                        born_date: temp.profile.born_date,
                        live: temp.profile.live,
                        sex: temp.profile.sex,
                        torrent_id: temp.profile.torrent_id,
                        _attachments: {},
                        is_user: false
                    }
                    if (temp.profile._attachments) {
                        for (data in temp.profile._attachments) {
                            new_user._attachments[data] = {
                                "data": new Buffer(temp.profile._attachments[data].data.toString('base64')),
                                contentType: temp.profile._attachments[data].content_type

                            };
                        }
                    }
                    db.db.get("profile_" + temp.profile._id).then(function (p) {
                        new_user._rev = p._rev;
                        db.db.put(new_user);
                    }).catch(function () {
                        db.db.put(new_user);
                    });

                    client.destroy();



                });


            });
        })
        res.json({
            "status": "success"
        });
    }

    function share(res) {
        client.destroy();
        client = new WebTorrent();
        var data = {};
        db.getUserGuid()
            .then(function (guid) {
                console.log(guid);
                db.getAllDocs(guid.value).then(function (data) {
                    console.log('Torrent info hash:', data);
                    var fileBuffer = new Buffer(JSON.stringify(data));
                    fileBuffer.name = data.profile.full_name;

                    client.seed(fileBuffer, function onTorrent(torrent) {
                        // Client is seeding the file!
                        console.log('Torrent info hash:', torrent.magnetURI);
                        console.log(client);
                        runPublish(guid.keypair.publicKey, guid.keypair.secretKey, torrent.infoHash)
                        if (res) res.json(torrent.infoHash)

                    });
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
                    response.json(err)
                    client.destroy();
                } else {
                    console.log('response:')
                    console.log(res)
                    client.destroy();

                    console.log(res.v.ih.toString('hex'));
                    getTorrent(res.v.ih.toString('hex'), response);
                }
            })

        })
    }
}