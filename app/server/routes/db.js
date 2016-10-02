
var guid = require('guid');
var PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-find'));
var db = new PouchDB('app-users');
var ed = require('ed25519-supercop')
db.info().then(function(info) {
    console.log(info);
})
module.exports = function() {
    return {
        db,
        getUserGuid,
        getUser,
        putUser,
        getPhoto,
        putPhoto,
        getPost,
        putPost,
        getAllUsers,
        getAllDocs
    }

    function getUserGuid() {
        return db.get("app_guid")
            .then(function(guid) {
                return guid;
            })
            .catch(function() {
                var kp = ed.createKeyPair(ed.createSeed());
                var keypair = {
                    publicKey: kp.publicKey.toString('hex'),
                    secretKey: kp.secretKey.toString('hex')
                };
                var result = {
                    _id: 'app_guid',
                    value: guid.raw(),
                    keypair: keypair
                };
                db.put(result).then(function(posts) {
                    console.log(posts);
                }).catch(function(err) {
                    console.log(err);
                });
                return result;
            });
    }

    function getUser(userGuid) {
        if (userGuid === undefined) {
            return getUserGuid()
                .then(function(guid) {
                    return db.get(guid.value, {attachments: true, binary:true});
                })
        } else {
            return db.get(userGuid, {attachments: true, binary:true});
        }
    }

    function getAllUsers() {
        return db.allDocs({
                include_docs: true,
                attachments: true,
                startkey: "profile_",
                endkey: 'profile_\uffff', binary:true
            })
    }

    function getAllDocs(userGuid) {
        var result = {};
        return getUser(userGuid)
            .then(function(profile){
                result.profile = profile;
            })
            .catch(function(err) {
                console.log(err);
            })
            .then(function(){
                return getPost(userGuid);
            })
            .then(function(posts){
                posts = posts.rows.map(function(val) {
                    return val.doc;
                });
                result.posts = posts;
            })
            .catch(function(err) {
                console.log(err);
            })
            .then(function(){
                return getPhoto(userGuid);
            })
            .then(function(photos){
                photos = photos.rows.map(function(val) {
                    return val.doc;
                });
                result.photos = photos;
            })
            .catch(function(err) {
                console.log(err);
            })
            .then(function(){
                return result;
            });
    }

    function putUser(user) {
        return getUser()
            .then(function(dbUser) {
                user._rev = dbUser._rev;
                return db.put(user);
            })
            .catch(function(err) {
                return getUserGuid()
                    .then(function(guid) {
                        user._id = guid.value;
                        user.torrent_id = guid.keypair.publicKey;
                        return db.put(user);
                    });
            });
    }

    function getPost(guid) {
        return getDoc(guid, 'post');
    }

    function putPost(post, userGuid) {
        return putDoc(post, 'post', userGuid);
    }

    function getPhoto(guid) {
        return getDoc(guid, 'photo');
    }

    function putPhoto(photo, userGuid) {
        return putDoc(photo, 'photo', userGuid);
    }

    function putDoc(doc, type, userGuid) {
        var today = new Date();
        if (userGuid === undefined) {
            return getUserGuid()
            .then(function(guid) {
                doc._id = type + "_" + guid.value + '_' + today.getTime();
                return db.put(doc)
            });
        } else {
            doc._id = type + "_" + userGuid + '_' + today.getTime();
            return db.put(doc)
        }
    }

    function getDoc(guid, type){
        if (guid === undefined) {
            return db.allDocs({
                include_docs: true,
                attachments: true,
                startkey: type + "_",
                endkey: type + '_\uffff', binary:true
            })
        } else {
            return db.allDocs({
                include_docs: true,
                attachments: true,
                startkey: type + "_" + guid + '_',
                endkey: type + "_" + guid + '_\uffff', binary:true
            })
        }
    }
}();