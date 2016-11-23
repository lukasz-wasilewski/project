(function () {
    'use strict';

    angular.module('myApp')
        .component('detailsComponent', {
            templateUrl: 'profil_uzytkownika/details/details.html',
            controller: ProfilUzytkownikaCtrl,
            bindings: {
                profile: '=',
                photo: '=',
                post: '<',
                editable: '<'
            }
        });

    function ProfilUzytkownikaCtrl(Profiles, $http, toastr, $state) {
        var ctrl = this;
        ctrl.saveProfile = function () {
            let photo = ctrl.photo === undefined ? null : ctrl.photo.toPNG();
            Profiles.save(ctrl.profile, photo)
                .then(function () {
                    toastr.success('Profil zapisano');
                    ctrl.post.info = ctrl.profile.full_name;
                    $state.reload();
                })
        };
    }

}());