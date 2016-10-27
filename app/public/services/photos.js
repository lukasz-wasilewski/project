(function () {
    'use strict';

    angular.module('myApp').factory('Photos', Photos);
    Photos.$inject = ['$http'];

    function Photos($http) {
        var db = require('./db');
        return {
            get: function (user_id, album_name) {
                return db.getPhoto(user_id)
                    .then(function (photos) {
                        console.log(photos);
                        var result = [];

                        for (var i = 0; i < photos.length; i++) {
                            result.push({
                                text: photos[i].text,
                                user: photos[i].user,
                                file: {
                                    data: photos[i].file.data,
                                    contentType: photos[i].file.contentType
                                },
                                type: photos[i].type,
                                info: photos[i].info,
                                to_delete: photos[i].to_delete
                            });
                        }

                        return result;
                    }).catch(function (err) {
                        console.log(err);
                    });


            },
            get_all: function (id) {
                return db.getPhoto(id)
                    .then(function (photos) {
                        console.log(photos);
                        var result = [];

                        for (var i = 0; i < photos.length; i++) {
                            result.push({
                                text: photos[i].text,
                                user: photos[i].user,
                                file: {
                                    data: photos[i].file.data,
                                    contentType: photos[i].file.contentType
                                },
                                type: photos[i].type,
                                info: photos[i].info,
                                to_delete: photos[i].to_delete
                            });
                        }

                        return result;
                    }).catch(function (err) {
                        console.log(err);
                    });
            },
            get_all_user: function () {
                return db.getPhoto()
                    .then(function (photos) {
                        photos = photos.rows.map(function (val) {
                            return val.doc;
                        });
                        console.log(photos);
                        var result = [];

                        for (var i = 0; i < photos.length; i++) {
                            result.concat(utils.prepareAttachementsDataFromDB(data.photos[i]));
                        }

                        return result;
                    }).catch(function (err) {
                        console.log(err);
                    });
            },
            save: function (newFile, files) {
                console.log('Done parsing form!', newFile, files);
                var album = {
                    text: newFile.text,
                    album: newFile.album
                }
                album._attachments = files;
                
                db.putPhoto(album).then(function (photo) {
                    
                });

            },
            delete: function (id) {
                return $http.delete('/photos/user/' + id);
            }
        };
    }
})();