var utils = require('./utils')();
module.exports = function(app, db) {

    app.get('/photos/:user_id', function(req, res) {
        db.getPhoto(req.params.user_id)
            .then(function(photos) {
                console.log(photos);
                var result = [];

                for (var i = 0; i < photos.length; i++) {
                    result.push({
                        text: photos[i].text,
                        user: photos[i].user,
                        file: {
                            data: photos[i].file.data.toString('base64'),
                            contentType: photos[i].file.contentType
                        },
                        type: photos[i].type,
                        info: photos[i].info,
                        to_delete: photos[i].to_delete
                    });
                }

                res.json(result);
            }).catch(function(err) {
                console.log(err);
                res.json(err);
            });
    });

    app.post('/photos/user', function(req, res) {
        db.getPhoto()
            .then(function(photos) {
                photos = photos.rows.map(function(val) {
                    return val.doc;
                });
                console.log(photos);
                var result = [];

                for (var i = 0; i < photos.length; i++) {
                    if (photos[i]._attachments) {
                        for (data in photos[i]._attachments) {
                            result.push({
                                text: photos[i].text,
                                file: {
                                    data: new Buffer(photos[i]._attachments[data].data).toString('base64'),
                                    contentType: photos[i]._attachments[data].content_type
                                },
                                album: photos[i].album
                            });
                        }
                    }
                }

                res.json(result);
            }).catch(function(err) {
                console.log(err);
                res.json(err);
            });
    });

    app.get('/photos/:user_id/:album_name', function(req, res) {
        db.getPhoto(req.params.user_id)
            .then(function(photos) {
                console.log(photos);
                var result = [];

                for (var i = 0; i < photos.length; i++) {
                    result.push({
                        text: photos[i].text,
                        user: photos[i].user,
                        file: {
                            data: photos[i].file.data.toString('base64'),
                            contentType: photos[i].file.contentType
                        },
                        type: photos[i].type,
                        info: photos[i].info,
                        to_delete: photos[i].to_delete
                    });
                }

                res.json(result);
            }).catch(function(err) {
                console.log(err);
                res.json(err);
            });


    });

    // create todo and send back all todos after creation
    app.post('/photos/save', function(req, res) {
        var newFile = {};
        utils.getFileFromRequest(req, newFile)
        req.busboy.on('finish', function() {
            console.log('Done parsing form!');
            var album = {
                text: newFile.text,
                album: newFile.album,
                _attachments: {}
            }
            for (var file_name in newFile.files) {
                var file_data = newFile.files[file_name];
                album._attachments[file_name] = {
                    content_type: file_data.type,
                    data: file_data.buffer,
                };
            }
            db.putPhoto(album).then(function(photo) {
                res.end("File uploaded.");
            });

        });


    });

    app.delete('/photos/:photo_id', function(req, res) {
        Content.remove({
            _id: req.params.post_id
        }, function(err, post) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Content.find({
                user: post._id
            }, function(err, posts) {
                if (err)
                    res.send(err)
                res.json(posts);
            });
        });
    });

}