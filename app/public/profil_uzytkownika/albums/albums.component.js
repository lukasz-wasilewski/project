(function () {
    'use strict';

    angular.module('myApp')
        .component('albumsComponent', {
            templateUrl: 'profil_uzytkownika/albums/albums.html',
            controller: ProfilUzytkownikaCtrl,
            bindings: {
                photos: '<',
                post: '<'
            }
        });

    function ProfilUzytkownikaCtrl($uibModal, $scope) {
        var ctrl = this;
        ctrl.open = function (id) {
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                templateUrl: 'myModalContent.html',
                size: 'lg'
            });
        };
        ctrl.album_view = "";
        ctrl.setAlbum = function (album) {
            ctrl.album_view = album;
        };
    }

}());