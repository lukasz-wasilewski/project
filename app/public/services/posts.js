(function () {
    'use strict';

    angular.module('myApp').factory('Posts', Posts);
    
    Posts.$inject = ['$http'];
    function Posts($http) {
        return {
            get: function () {
                return $http.get('/posts/user');
            },
            get_all: function () {
                return $http.get('/posts/list');
            },
            save: function (post) {
                return $http.post('/posts/save', post);
            },
            delete: function (id) {
                return $http.delete('/posts/user/' + id);
            }
        };
    }
})();