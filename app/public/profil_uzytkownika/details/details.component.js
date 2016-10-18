(function () {
    'use strict';

    angular.module('myApp')
    .component('detailsComponent', {
        templateUrl: 'profil_uzytkownika/details/details.html',
        controller: ProfilUzytkownikaCtrl,
        bindings: {
            profile: '=',
            post: '=',
            profile_photo: '=',
            editable: '<'
        }
    });

    function ProfilUzytkownikaCtrl(Profiles, $http) {
        var ctrl = this;
        ctrl.saveProfile = function () {
            console.log("Saving data...");
            console.log(ctrl.profile);
            var fd = new FormData();
            fd.append("full_name", ctrl.profile.full_name);
            fd.append("job", ctrl.profile.job);
            fd.append("born_date", ctrl.profile.born_date);
            fd.append("live", ctrl.profile.live);
            fd.append("sex", ctrl.profile.sex);
            fd.append("torrent_id", ctrl.profile.torrent_id);
            if(ctrl.profile.profile_photo) {
                fd.append("files[]", ctrl.profile.profile_photo);
            }
            Profiles.save(fd)
            toastr.success('Profil zapisano');
            ctrl.post.info = ctrl.profile.full_name;
            Profiles.get_data();
        };
    }

}());