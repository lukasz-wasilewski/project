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
            }
        };
    }
})();