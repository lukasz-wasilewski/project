(function () {
    'use strict';

    angular.module('myApp')
    .component('postsComponent', {
        templateUrl: 'profil_uzytkownika/posts/posts.html',
        controller: ProfilUzytkownikaCtrl,
        bindings: {
            post: "<",
            posts: '<',
            editable: '<'
        }
    });

    function ProfilUzytkownikaCtrl(Posts, toastr) {
        var ctrl = this;
        ctrl.$onChanges =function(changesObj){
            console.log(changesObj);
        }
        ctrl.createPost = function () {
            if (ctrl.post.user != "") {
                Posts.save(ctrl.post)
                    .then(function (data) {
                        //$scope.post = $scope.getNewPost();
                       
                        
                        ctrl.posts.push(angular.copy(ctrl.post));
                        toastr.success('Dodano post');
                    });
            }
        };
    }

}());