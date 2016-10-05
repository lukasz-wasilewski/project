(function () {
    'use strict';

    angular.module('myApp').factory('Photos', Photos);
    Photos.$inject = ['$http'];
    function Photos($http) {
        return {
            get: function (user_id, album_name) {
                return $http.get('/photos/' + user_id + '/' + album_name);
            },
            get_all: function (id) {
                return $http.get('/photos/' + id);
            },
            get_all_user: function () {
                return $http.get('/photos/user');
            },
            save: function (photo) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/photos/save', true);
                return xhr.send(photo);
            },
            delete: function (id) {
                return $http.delete('/photos/user/' + id);
            }
        };
    }
})();