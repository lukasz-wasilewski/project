(function () {
  'use strict';

  angular.module('myApp')
    .component('homeComponent', {
      templateUrl: 'home/home.html',
      controller: HomeCtrl
    });

  function HomeCtrl($scope, $http, Posts) {
    var ctrl = this;
    ctrl.post = {};
    ctrl.posts = [];
    Posts.get_all()
      .then(function (data) {
        ctrl.posts.push.apply(ctrl.posts, data)
        $scope.$apply();
      });
  }
})();