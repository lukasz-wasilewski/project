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

        ctrl.copyToClipboard = function() {
            const {clipboard} = require('electron')
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
                    profile_photo: "",
                    to_delete: false
                };
            };
            $scope.torrent_hash = "";
            $scope.post = $scope.getNewPost();
            $scope.photos = {};


            var getting_profil = Profiles.get_all_user_data(ctrl.id)
                .success(function (data) {
                    console.log(data);
                    if (data != null) {
                        var profile = data.profile;
                        $scope.profile = profile;
                        $scope.profile.born_date = new Date(profile.born_date);
                        $scope.post.user = profile.torrent_id;
                        $scope.post.info = profile.full_name;
                        if (profile._attachments) {
                            $scope.photo = "data:" + profile._attachments["profilowe"].content_type + ";base64," + profile._attachments["profilowe"].data;
                        }

                        var result = {};
                        for (var i = 0; i < data.photos.length; i++) {
                            data.photos[i].file.data = "data:" + data.photos[i].file.contentType + ";base64, " + data.photos[i].file.data;
                            if (data.photos[i].album in result) {
                                result[data.photos[i].album].push(data.photos[i]);
                            } else {
                                result[data.photos[i].album] = [data.photos[i]];
                            }
                        }
                        $scope.photos = result;
                        $scope.posts = data.posts;
                    }
                })
                .error(function (data) {
                    console.log(data);
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


        $scope.upload_profile = function (FlowFile, message, event) {
            console.log('catchAll', FlowFile);
            $scope.profile.profile_photo = FlowFile.file;
        };
    }
})();