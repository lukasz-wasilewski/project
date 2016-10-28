(function () {
    'use strict';

    angular.module('myApp').factory('Photos', Photos);
    Photos.$inject = ['$http'];

    function Photos($http) {
        var db = require('./db');
        return {
            save
        };

        function save(newFile, files) {
            console.log('Done parsing form!', newFile, files);
            var album = {
                text: newFile.text,
                album: newFile.album
            }
            album._attachments = files;

            db.putPhoto(album);
        }
    }
})();