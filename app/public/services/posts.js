(function () {
    'use strict';

    angular.module('myApp').factory('Posts', Posts);

    Posts.$inject = ['$http'];

    function Posts($http) {
        var db = require('./db');
        return {
            get_all,
            save
        };

        function get_all() {
            return db.getPost();
        }

        function save(post) {
            return db.getUser()
                .then(function (profile) {
                    db.putPost({
                        text: post.text,
                        full_name: profile.full_name,
                        to_delete: false
                    }).then(function (posts) {
                        return posts;
                    }).catch(function (err) {
                        console.log(err);
                    });
                });
        }
    }
})();