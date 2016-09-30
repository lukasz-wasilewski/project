(function () {
    'use strict';

    angular.module('myApp', [
    'ui.router',
    'ui.bootstrap',
    'flow'
    ]).config(['$urlRouterProvider', '$stateProvider', 'flowFactoryProvider', function ($urlRouterProvider, $stateProvider, flowFactoryProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider.state({
            name: 'home',
            url:'/home',
            component: 'homeComponent'
        });
        $stateProvider.state({
            name: 'profil_uzytkownika',
            url:'/profil_uzytkownika',
            component: 'profilUzytkownikaComponent'
        });
        $stateProvider.state({
            name: 'profil_uzytkownika.details',
            url:'/details',
            template: '<details-component profile="profile" post="post"></details-component>'
        });
        $stateProvider.state({
            name: 'profil_uzytkownika.posts',
            url:'/posts',
            template: '<posts-component post="post" posts="posts"></posts-component>'
        });
        $stateProvider.state({
            name: 'profil_uzytkownika.albums',
            url:'/albums',
            template: '<albums-component photos="photos"></albums-component>'
        });
        $stateProvider.state({
            name: 'profil_uzytkownika.uploader',
            url:'/uploader',
            template: '<uploader-component post="post"></uploader-component>'
        });
        $stateProvider.state({
            name: 'profile',
            url:'/profile/{personId}',
            component: 'profileComponent',
            resolve: {
                id: function( $transition$) {
                    console.log($transition$.params().personId);
                    return $transition$.params().personId;
                }
            }
        });
        $stateProvider.state({
            name: 'friends_list',
            url:'/friends_list',
            component: 'friendsListComponent'
        });
        
        flowFactoryProvider.defaults = {
            permanentErrors: [404, 500, 501],
            maxChunkRetries: 1,
            chunkRetryInterval: 5000,
            simultaneousUploads: 4,
            singleFile: false
        };
    }]);
})();