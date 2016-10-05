var utils = require('./utils')();
module.exports = function (app, db, t) {

    app.get('/profiles/list', function (req, res) {
        db.getAllUsers().then(function (profiles) {
            for (var i = 0; i < profiles.rows.length; i++) {
                if (profiles.rows[i].doc._attachments) {
                    profiles.rows[i].doc._attachments["profilowe"].data = new Buffer(profiles.rows[i].doc._attachments["profilowe"].data).toString('base64');
                }
            }
            res.json(profiles.rows);
        });
    });

    app.get('/profiles/user', function (req, res) {
        db.getUser()
            .then(function (profile) {
                console.log(profile);
                if (profile._attachments) {
                    profile._attachments["profilowe"].data = new Buffer(profile._attachments["profilowe"].data).toString('base64');
                }
                res.json(profile);
            }).catch(function (err) {
                console.log(err);
                res.json(err);
            });
    });

    function getUserData(guid, res) {
        db.getAllDocs(guid)
            .then(function (data) {
                console.log(data);
                if (data.profile) {
                    if (data.profile._attachments) {
                        data.profile._attachments["profilowe"].data = new Buffer(data.profile._attachments["profilowe"].data).toString('base64');
                    }
                    var result = [];
                    for (var i = 0; i < data.photos.length; i++) {
                        result = result.concat(utils.prepareAttachementsDataFromDB(data.photos[i]));
                    }
                    data.photos = result;
                    res.json(data);
                } else{
                res.status(404).json("aa");
                }

            }).catch(function (err) {
                console.log(err);
                res.status(404).json(err);
            });
    }

    app.get('/profiles/all_data/:user_id', function (req, res) {
        var user_id = req.params.user_id;
        if (req.params.user_id === "user") {
            db.getUserGuid()
                .then(function (guid) {
                    getUserData(guid.value, res);
                })
        } else {
            getUserData(req.params.user_id, res);
        }

    });

    app.get('/profiles/user/:user_id', function (req, res) {
        db.getUser(req.params.user_id)
            .then(function (profile) {
                console.log(profile);
                res.json(profile);
            }).catch(function (err) {
                console.log(err);
                res.json(err);
            });
    });

    app.post('/profiles/save', function (req, res) {
        var newFile = {};
        utils.getFileFromRequest(req, newFile)
        req.busboy.on('finish', function () {
            console.log('Done parsing form!');
            var profile = {};
                    profile.full_name = newFile.full_name;
                    profile.job = newFile.job;
                    profile.born_date = newFile.born_date;
                    profile.live = newFile.live;
                    profile.sex = newFile.sex;
                    db.putUser(profile).then(function (photo) {
                        var keys = Object.keys(newFile.files);
                        var last = keys[keys.length - 1];
                        if (keys.length === 0) {
                            t.share(res);
                        }
                        for (var file_name in newFile.files) {
                            console.log(photo.id);
                            var file_data = newFile.files[file_name];
                            db.db.putAttachment(photo.id, "profilowe", photo.rev, file_data.buffer, file_data.type).then(function (result) {
                                // handle result
                                if (file_name === last)
                                    t.share(res)
                            }).catch(function (err) {
                                console.log(err);
                                res.json(err);
                            });
                        }
                    });
                });

        res.end("File uploaded.");
    });

}