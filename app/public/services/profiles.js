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
            return db.getAllUsers();
        }

        function save(profile, photo) {
            console.log('Done parsing form!', profile, photo);
            db.putUser(profile).then(function (pro) {
                if (photo) {
                    db.db.putAttachment(pro.id, "profilowe", pro.rev, photo, "image/png");
                }
            });

        }

        function get_all_user_data(id) {
            if (id === "user") {
                return db.getUserGuid()
                    .then(function (guid) {
                        return db.getAllDocs(guid.value);
                    })
            } else {
                return db.getAllDocs(id);
            }
        }
    }
})();