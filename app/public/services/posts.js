(function () {
    'use strict';

    angular.module('myApp').factory('Posts', Posts);

    Posts.$inject = ['$http'];

    function Posts($http) {
        var db = require('./db');
        return {
            get: function () {
                return db.getUserGuid()
                    .then(function (guid) {
                        console.log(guid)
                        return db.getPost(guid.value)
                            .then(function (posts) {
                                posts = posts.rows.map(function (val) {
                                    return val.doc;
                                });
                                console.log(posts);
                                return posts;
                            }).catch(function (err) {
                                console.log(err);
                            });
                    });
            },
            get_all: function () {
                return db.getPost()
                    .then(function (posts) {
                        posts = posts.rows.map(function (val) {
                            return val.doc;
                        });
                        return posts;
                    }).catch(function (err) {
                        console.log(err);
                    });
            },
            save: function (post) {
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
            },
            delete: function (id) {
                return $http.delete('/posts/user/' + id);
            }
        };
    }
})();