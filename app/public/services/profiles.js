(function () {
    'use strict';
    
    angular.module('myApp').factory('Profiles', Profiles);
              
    Profiles.$inject = ['$http'];
    function Profiles($http) {
        return {
            get: function () {
                return $http.get('/profiles/list');
            },
            save: function (profil) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/profiles/save', true);
                return xhr.send(profil);
            },
            get_profile: function (id) {
                return $http.get('/profiles/user/' + id);
            },
            get_user: function () {
                return $http.get('/profiles/user');
            },
            get_all_user_data: function (id) {
                return $http.get('/profiles/all_data/' + id);
            },
            get_data: function () {
                return $http.get('/data');
            },
            post_data: function (id) {
                return $http.post('/data/' + id);
            },
            save_friend: function (data) {
                return $http.post('/save_friend',data);
            }
        };
    }
})();