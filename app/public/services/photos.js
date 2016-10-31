(function () {
    'use strict';

    angular.module('myApp').factory('Photos', Photos);
    Photos.$inject = ['$http'];

    function Photos($http) {
        var db = require('./db');
        return {
            save
        };

        function save(album, files) {
            console.info('Saving album', album, files);
            return db.putPhoto({
                text: album.text,
                album: album.album,
                _attachments: files
            });
        }
    }
})();