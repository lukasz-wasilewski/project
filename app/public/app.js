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
            url: '/home',
            component: 'homeComponent'
        });
        $stateProvider.state({
            name: 'profile',
            url: '/profile/{personId}',
            component: 'profilUzytkownikaComponent',
            resolve: {
                id: function ($transition$) {
                    console.log($transition$.params().personId);
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

        flowFactoryProvider.defaults = {
            permanentErrors: [404, 500, 501],
            maxChunkRetries: 1,
            chunkRetryInterval: 5000,
            simultaneousUploads: 4,
            singleFile: false
        };
    }]).run(function (Profiles) {
        Profiles.get_data().then(function (data) {
            var client = new WebTorrent()
            var blob = new Blob([JSON.stringify(data)], {
                type: 'application/json'
            });
            blob.name = 'Some file name'
            client.seed(blob, function (t) {
                console.log(t.magnetURI);
                Profiles.post_data(t.infoHash).then(function(){

                })
            })
        })

    });
})();