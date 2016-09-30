(function () {
    'use strict';

    angular.module('myApp')
    .component('profilUzytkownikaComponent', {
        templateUrl: 'profil_uzytkownika/profil_uzytkownika.html',
        controller: ProfilUzytkownikaCtrl
    });
                
    function ProfilUzytkownikaCtrl($scope, $window, $http, Profiles, Posts, Photos, $q) {
        $scope.getNewPost = function() {
            return {
                text: "",
                user: "",
                file: {data: "", contentType: ""},
                type: "post",
                info: "",
                profile_photo: "",
                to_delete: false
            };
        };
        $scope.torrent_hash = "";
        $scope.post = $scope.getNewPost();
        $scope.photos = {};
       

        var getting_profil = Profiles.get_user()
            .success(function (data) {
                console.log(data);
                if(data != null) {
                    var profile = data;
                    $scope.profile = profile;
                    $scope.profile.born_date = new Date(profile.born_date);
                    $scope.post.user = profile.torrent_id;
                    $scope.post.info = profile.full_name;
                        if(profile._attachments) {
                            $scope.photo = "data:" + profile._attachments["profilowe"].content_type + ";base64," + profile._attachments["profilowe"].data;
                        }

                } })
                .error( function(data) {
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

        var getting_photos = Photos.get_all_user().success(function(data) {
            var result = {};
            for(var i = 0; i < data.length; i++) {
                data[i].file.data = "data:"+data[i].file.contentType+";base64, "+ data[i].file.data;
                if(data[i].album in result){
                    result[data[i].album].push(data[i]);
                } else {
                    result[data[i].album] = [data[i]];
                }
            }
            $scope.photos = result;
        });

        var getting_posts = Posts.get()
            .success(function(data) {
                if(data != null) {
                    $scope.posts = data;
                }
            });

       $q.all([getting_posts, getting_profil, getting_photos]).then(function(){
            console.log("ALL PROMISES RESOLVED");
           //$scope.saveProfile();
            
        });

        $scope.upload_profile = function (FlowFile, message, event) {
            console.log('catchAll', FlowFile);
            $scope.profile.profile_photo = FlowFile.file;
        };
    }
})();