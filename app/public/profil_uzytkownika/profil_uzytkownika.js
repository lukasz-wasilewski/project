(function () {
    'use strict';

    angular.module('myApp')
        .component('profilUzytkownikaComponent', {
            templateUrl: 'profil_uzytkownika/profil_uzytkownika.html',
            controller: ProfilUzytkownikaCtrl,
            bindings: {
                id: '<',
                editable: '<'
            }
        });

    function ProfilUzytkownikaCtrl($scope, $window, $http, Profiles, Posts, Photos, $q) {
        var ctrl = this;
        const nativeImage = require('electron').nativeImage

        ctrl.copyToClipboard = function () {
            const {
                clipboard
            } = require('electron')
            clipboard.writeText($scope.post.user)
        }

        ctrl.$onInit = function () {

            $scope.getNewPost = function () {
                return {
                    text: "",
                    user: "",
                    file: {
                        data: "",
                        contentType: ""
                    },
                    type: "post",
                    info: "",
                    to_delete: false
                };
            };
            $scope.torrent_hash = "";
            $scope.post = $scope.getNewPost();
            $scope.photos = [];
            $scope.posts = [];


            var getting_profil = Profiles.get_all_user_data(ctrl.id)
                .then(function (data) {
                    if (data != null) {
                        var profile = data.profile;
                        $scope.profile = profile;
                        $scope.profile.born_date = new Date(profile.born_date);
                        $scope.post.user = profile.torrent_id;
                        $scope.post.info = profile.full_name;
                        if (profile._attachments) {
                            $scope.photo = nativeImage.createFromBuffer(profile._attachments["profilowe"].data);
                        }

                        for (var i = 0; i < data.photos.length; i++) {
                            for(var name in data.photos[i]._attachments){
                                var img = nativeImage.createFromBuffer(data.photos[i]._attachments[name].data);
                                data.photos[i]._attachments[name].data = img.toDataURL();
                            }
                        }

                        $scope.photos.push.apply($scope.photos, data.photos);
                        $scope.posts.push.apply($scope.posts, data.posts)
                        $scope.$apply();
                    }
                })
                .catch(function (data) {
                    $scope.profile = {
                        full_name: "",
                        job: "",
                        born_date: new Date(),
                        live: "",
                        sex: "Kobieta",
                        torrent_id: ""
                    };
                });
        }


        $scope.upload_profile = function () {
            const {
                dialog
            } = require('electron').remote;

            let file = dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{
                    name: 'Images',
                    extensions: ['jpg', 'png', 'gif']
                }]
            })
            let image = nativeImage.createFromPath(file[0])
            $scope.photo = image;
        };
    }
})();