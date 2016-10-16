(function () {
    'use strict';

    angular.module('myApp')
        .component('friendsListComponent', {
            templateUrl: 'friends_list/friends_list.html',
            controller: FriendsListCtrl
        });

    function FriendsListCtrl($scope, $window, Profiles, $http, Photos, $filter, $location) {
        var ctrl = this;

        ctrl.copyFromClipboard = function () {
            const {
                clipboard
            } = require('electron')
            $scope.search_id = clipboard.readText();
        }

        Profiles.get()
            .success(function (data) {
                $scope.friends_list = data;
                for (var i = 0; i < data.length; i++) {
                    data[i].photo = "data:" + data[i].doc._attachments["profilowe"].content_type + ";base64," + data[i].doc._attachments["profilowe"].data;
                }
            });
        $scope.search_id = "";
        $scope.goToProfile = function (profile) {
            $location.path("/profile/" + profile.id);
        };
        $scope.get = function () {

            $http.post('/upload/' + $scope.search_id)
                .success(function (data) {
                    console.log(data);
                    var client = new WebTorrent()
                    var torrent = client.add(data, function (t) {
                        console.log(t.infoHash);

                    })

                    torrent.on('done', function () {
                        console.log("aaa");
                        torrent.files.forEach(function (file) {
                            // Get a url for each file
                            console.log(file);
                            file.getBlob(function (err, buffer) {
                                if (err) throw err;
                                console.log(buffer);
                                var reader = new window.FileReader();
                                reader.readAsText(buffer);
                                reader.onloadend = function () {
                                    var base64data = reader.result;
                                    Profiles.save_friend(base64data).then(function(a){
                                        console.log(a);
                                    });
                                }

                            })
                        })
                    })

                });
        };
    }
})();