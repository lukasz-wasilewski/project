var WebTorrent = require('webtorrent');
var client = new WebTorrent();
module.exports = function(app, db, t) {

    app.get('/profiles/list', function(req, res) {
        db.getAllUsers().then(function(profiles) {

            res.json(profiles.rows);
        });
    });

    app.get('/profiles/user', function(req, res) {
        db.getUser()
        .then(function(profile) {
            console.log(profile);
            if(profile._attachments){
            profile._attachments["profilowe"].data = new Buffer(profile._attachments["profilowe"].data).toString('base64');
            }
            res.json(profile);
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
    });

    app.get('/profiles/user/:user_id', function(req, res) {
        db.getUser(req.params.user_id)
        .then(function(profile) {
            console.log(profile);
            res.json(profile);
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
    });

    app.post('/profiles/save', function(req, res) {
        var new_photo = {
            files: {}
        };

        req.pipe(req.busboy);
        req.busboy.on('field', function(fieldname, val) {
            console.log('Field [' + fieldname + ']: value: ' + val);
            new_photo[fieldname] = val;
        });
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log("Uploading: " + filename);
            var fileBuffer = new Buffer('');
            //Path where image will be uploaded
            file.on('data', function(data) {
                console.log('File [' + filename + '] got ' + data.length + ' bytes');
                fileBuffer = Buffer.concat([fileBuffer, data]);
            });

            file.on('end', function() {
                console.log('File [' + filename + '] Finished');
                new_photo.files[filename] = {
                    buffer: fileBuffer,
                    type: mimetype,
                    filename: filename
                };
            });
        });
        req.busboy.on('finish', function() {
            console.log('Done parsing form!');
            var profile = {
                full_name: new_photo.full_name,
                job: new_photo.job,
                born_date: new_photo.born_date,
                live: new_photo.live,
                sex: new_photo.sex,
            };
            db.putUser(profile).then(function(photo) {
                var keys = Object.keys(new_photo.files);
                var last = keys[keys.length-1];
                if(keys.length === 0){
                    t.share(res);
                }
                for (var file_name in new_photo.files) {
                    console.log(photo.id);
                    var file_data = new_photo.files[file_name];
                    db.db.putAttachment(photo.id, "profilowe", photo.rev, file_data.buffer, file_data.type).then(function(result) {
                        // handle result
                        if(file_name === last)
                            t.share(res)
                    }).catch(function(err) {
                        console.log(err);
                        res.json(err);
                    });
                }
            });

        });
        res.end("File uploaded.");
    });



}