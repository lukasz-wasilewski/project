(function () {
    'use strict';

    angular.module('myApp')
        .component('friendsListComponent', {
            templateUrl: 'friends_list/friends_list.html',
            controller: FriendsListCtrl
        });

    function FriendsListCtrl($scope, $window, Profiles, $http, Photos, $filter, $location, toastr, $state, Torrent) {
        var ctrl = this;

        ctrl.copyFromClipboard = function () {
            const {
                clipboard
            } = require('electron')
            $scope.search_id = clipboard.readText();
        }
        const nativeImage = require('electron').nativeImage

        Profiles.get()
            .then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].photo = nativeImage.createFromBuffer(data[i].doc._attachments["profilowe"].data);
                }
                $scope.friends_list = data;
                $scope.$apply();
            });
        $scope.search_id = "";
        $scope.goToProfile = function (profile) {
            $location.path("/profile/" + profile.id);
        };
        $scope.get = function () {
            ctrl.progress = true;
            Torrent.runConsume($scope.search_id)
                /*
                                setTimeout(function () {
                                    toastr.success('Dodano znajomego');
                                    ctrl.progress = false;
                                    $state.reload();
                                }, 10000)
                */
        };
    }
})();