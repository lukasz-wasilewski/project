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
                    Photos.get(data[i]._id, "actual_photo").success(function(data) {
                        if(data.length > 0) {
                            data[0].file.data = "data:" + data[0].file.contentType + ";base64, " + data[0].file.data;
                            var user = $filter('filter')($scope.friends_list, function (d) {return d.id === data.user;})[0];
                            user.photo = data[0].file.data;
                        }
                    });
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