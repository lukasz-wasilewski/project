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
        ctrl.createPost = function () {
            if (ctrl.post.user != "") {
                Posts.save(ctrl.post)
                    .then(function (data) {
                        ctrl.posts.push(angular.copy(ctrl.post));
                        toastr.success('Dodano post');
                    });
            }
        };
    }

}());