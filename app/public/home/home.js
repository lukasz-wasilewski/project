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

        Posts.get_all()
          .success(function (data) {
            ctrl.posts = data;
          });

      ctrl.deleteTodo = function (id) {
          Posts.delete(id)
            .success(function (data) {
              ctrl.posts = data;
            });
      };
    }
})();