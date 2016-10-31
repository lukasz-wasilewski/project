(function () {
    'use strict';
    var db = require('./services/db');
    
    angular.module('myApp', [
        'ui.router',
        'ui.bootstrap',
        'toastr'
    ]).config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider.state({
            name: 'home',
            url: '/home',
            component: 'homeComponent'
        });
        $stateProvider.state({
            name: 'profile',
            url: '/profile/{personId}',
            component: 'profilUzytkownikaComponent',
            resolve: {
                id: function ($transition$) {
                    return $transition$.params().personId;
                },
                editable: function ($transition$) {
                    return $transition$.params().personId === "user";
                }
            }
        });
        $stateProvider.state({
            name: 'friends_list',
            url: '/friends_list',
            component: 'friendsListComponent'
        });

    }]).run(function (Profiles, Torrent) {
        Torrent.share();
        setInterval(function () {
            db.getAllUsers().then(function (profiles) {
                    for (var i = 0; i < profiles.length; i++) {
                        Torrent.runConsume(profiles[i].doc.torrent_id)
                    }
                });
        }, 30000);
    });
})();