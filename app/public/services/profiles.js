(function () {
    'use strict';

    angular.module('myApp').factory('Profiles', Profiles);

    Profiles.$inject = ['$http', 'toastr'];

    function Profiles($http, toastr) {
        var client = new WebTorrent()
        return {
            get: function () {
                return $http.get('/profiles/list');
            },
            save: function (profil) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/profiles/save', true);
                return xhr.send(profil);
            },
            get_profile: function (id) {
                return $http.get('/profiles/user/' + id);
            },
            get_user: function () {
                return $http.get('/profiles/user');
            },
            get_all_user_data: function (id) {
                return $http.get('/profiles/all_data/' + id);
            },
            get_data,
            post_data,
            save_friend,
            get_friend
        };

        function post_data(id) {
            return $http.post('/data/' + id);
        }

        function get_data() {
            return $http.get('/data')
                .then(function (data) {
                    client.destroy();
                    client = new WebTorrent()
                    var blob = new Blob([JSON.stringify(data)], {
                        type: 'application/json'
                    });
                    blob.name = 'Some file name'
                    client.seed(blob, function (t) {
                        console.log(t.magnetURI);
                        post_data(t.infoHash).then(function () {
                            toastr.success('Profil udostepniono z sukcesem');
                        })
                    })
                });
        }

        function save_friend(data) {
            return $http.post('/save_friend', data);
        }

        function get_friend(data) {
            return $http.post('/upload/' + data)
                .success(function (data) {
                    console.log(data);
                    var client = new WebTorrent()
                    var torrent = client.add(data, function (t) {
                        console.log(t.infoHash);

                    })

                    torrent.on('done', function () {
                        console.log("aaa");
                        torrent.files.forEach(function (file) {
                            // Get a url for each file
                            console.log(file);
                            file.getBlob(function (err, buffer) {
                                if (err) throw err;
                                console.log(buffer);
                                var reader = new window.FileReader();
                                reader.readAsText(buffer);
                                reader.onloadend = function () {
                                    var base64data = reader.result;
                                    save_friend(base64data).then(function (a) {
                                        console.log(a);
                                        
                                        client.destroy();
                                    });
                                }

                            })
                        })
                    })

                });
        }
    }
})();