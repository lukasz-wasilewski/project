(function () {
    'use strict';

    angular.module('myApp').factory('Profiles', Profiles);

    Profiles.$inject = ['$http', 'toastr'];

    function Profiles($http, toastr) {
        var db = require('./db');
        
        return {
            get,
            save,
            get_all_user_data
        };

        function get() {
            return db.getAllUsers().then(function (profiles) {
                return profiles.rows;
            });
        }

        function save(profile, photo) {
            console.log('Done parsing form!', profile, photo);
            db.putUser(profile).then(function (pro) {
                if (photo) {
                    console.log(pro.id);
                    db.db.putAttachment(pro.id, "profilowe", pro.rev, photo, "image/png")
                        .then(function (result) {}).catch(function (err) {
                            console.log(err);
                        });
                }
            });

        }

        function get_all_user_data(id) {
            if (id === "user") {
                return db.getUserGuid()
                    .then(function (guid) {
                        return getUserData(guid.value);
                    })
            } else {
                return getUserData(id);
            }
        }

        function getUserData(guid) {
            return db.getAllDocs(guid)
                .then(function (data) {
                    console.log(data);
                    if (data.profile) {
                        return data;
                    } else {
                        return "none";
                    }

                }).catch(function (err) {
                    console.log(err);
                });
        }
    }
})();