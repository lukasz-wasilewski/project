(function () {
    'use strict';

    angular.module('myApp').factory('Profiles', Profiles);

    Profiles.$inject = ['$http', 'toastr', 'Torrent'];

    function Profiles($http, toastr, Torrent) {
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
            console.info('Saving user profile data.', profile, photo);
            return db.putUser(profile).then(function (pro) {
                if (photo) {
                    return db.db.putAttachment(pro.id, "profilowe", pro.rev, photo, "image/png")
                    .then(function(){
                        Torrent.share();
                    });
                } else {
                    Torrent.share();
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