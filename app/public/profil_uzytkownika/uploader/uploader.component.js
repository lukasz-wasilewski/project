(function () {
    'use strict';

    angular.module('myApp')
    .component('uploaderComponent', {
        templateUrl: 'profil_uzytkownika/uploader/uploader.html',
        controller: ProfilUzytkownikaCtrl,
        bindings: {
            post: '<'
        }
    });

    function ProfilUzytkownikaCtrl(Photos) {
        var ctrl = this;
        ctrl.upload = function (FlowFile, message, event) {
            console.log('catchAll', FlowFile);
            var fd = new FormData();
            //Take the first selected file
            for(var i = 0; i < FlowFile.length; i++) {
                fd.append("files[]", FlowFile[i].file);
            }
            fd.append("text", "");
            fd.append("user", ctrl.post.user);
            fd.append("album", ctrl.album.name);
            console.log(ctrl.album.name);
            Photos.save(fd);
        };
    }

}());