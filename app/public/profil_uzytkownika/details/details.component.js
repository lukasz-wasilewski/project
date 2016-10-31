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
            Profiles.save(ctrl.profile, ctrl.photo.toPNG())
                .then(function () {
                    toastr.success('Profil zapisano');
                    ctrl.post.info = ctrl.profile.full_name;
                    $state.reload();
                })
        };
    }

}());