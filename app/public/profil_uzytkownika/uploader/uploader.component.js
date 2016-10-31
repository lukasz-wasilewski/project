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

    function ProfilUzytkownikaCtrl(Photos, $state, toastr) {
        var ctrl = this;
        const {
            dialog
        } = require('electron').remote;
        const nativeImage = require('electron').nativeImage

        ctrl.selectFiles = function () {
            let paths = dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [{
                    name: 'Images',
                    extensions: ['jpg', 'png', 'gif']
                }]
            })
            console.log(paths);
            ctrl.files = {}
            for (var i = 0; i < paths.length; i++) {
                let image = nativeImage.createFromPath(paths[i])
                ctrl.files["file_" + i] = {
                    data: image.toPNG(),
                    contentType: "image/png"
                }
            }

        }

        ctrl.upload = function () {
            var file = {
                "text": "",
                "user": ctrl.post.user,
                "album": ctrl.album.name
            }

            Photos.save(file, ctrl.files)
                .then(function () {
                    toastr.success('Zdjecia dodano');
                    $state.reload();
                });

        };
    }

}());