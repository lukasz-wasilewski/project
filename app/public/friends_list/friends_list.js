(function () {
    'use strict';

    angular.module('myApp')
        .component('friendsListComponent', {
            templateUrl: 'friends_list/friends_list.html',
            controller: FriendsListCtrl
        });
                    
    function FriendsListCtrl($scope, $window, Profiles, $http, Photos, $filter, $location) {
        Profiles.get()
            .success(function (data) {
                $scope.friends_list = data;
                for(var i = 0; i < data.length; i++) {
                    data[i].photo = "data:" + data[i].doc._attachments["profilowe"].content_type + ";base64," + data[i].doc._attachments["profilowe"].data;
                }
            });
        $scope.search_id = "";
        $scope.goToProfile = function (profile) {
            $location.path("/profile/"+profile.id);
        };
        $scope.get = function () {
            $http.post('/upload/'+ $scope.search_id)
                .success(function (data) {
                    console.log(data);
                });
        };
    }
})();