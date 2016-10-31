var guid = require('guid');
var PouchDB = require('pouchdb');
var homedir = require('homedir');
const path = require('path');
var fs = require('fs');
var dbPath = homedir() + path.sep + 'app-users';
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
}
var db = new PouchDB(dbPath + path.sep + 'my.db');
var ed = require('ed25519-supercop')
db.info().then(function (info) {
    console.info("Connected to database.",info);
})
module.exports = function () {
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
            .then(function (guid) {
                return guid;
            })
            .catch(function () {
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
                db.put(result).then(function (guid) {
                    console.info("Created user guid.",guid);
                }).catch(function (err) {
                    console.error("Error while creating user guid.",err);
                });
                return result;
            });
    }

    function getUserData(userGuid) {
        if (userGuid === undefined) {
            return getUserGuid()
                .then(function (guid) {
                    return db.get(guid.value, {
                        attachments: true,
                        binary: true
                    });
                })
        } else {
            return db.get(userGuid, {
                attachments: true,
                binary: true
            });
        }
    }

    function getUser(userGuid) {
        return getUserData(userGuid)
            .then(function (profile) {
                return profile;
            })
            .catch(function (err) {
                console.error(err);
            })
    }

    function getAllUsers() {
        return db.allDocs({
            include_docs: true,
            attachments: true,
            startkey: "profile_",
            endkey: 'profile_\uffff',
            binary: true
        }).then(function (profiles) {
            return profiles.rows;
        });
    }

    function getAllDocs(userGuid) {
        return Promise.all([
            getUser(userGuid),
            getPost(userGuid),
            getPhoto(userGuid)
        ]).then(values => {
            let result = {
                profile: values[0],
                posts: values[1],
                photos: values[2]
            }
            console.info("Retrived user data from db.", result);
            return result;
        });
    }

    function putUser(user) {
        return getUser()
            .then(function (dbUser) {
                user._rev = dbUser._rev;
                return db.put(user);
            })
            .catch(function (err) {
                return getUserGuid()
                    .then(function (guid) {
                        user._id = guid.value;
                        user.torrent_id = guid.keypair.publicKey;
                        return db.put(user);
                    });
            });
    }

    function getPost(guid) {
        return getDoc(guid, 'post')
            .then(function (posts) {
                return posts.rows.map(function (val) {
                    return val.doc;
                });
            })
            .catch(function (err) {
                console.error(err);
            });
    }

    function putPost(post, userGuid) {
        return putDoc(post, 'post', userGuid);
    }

    function getPhoto(guid) {
        return getDoc(guid, 'photo')
            .then(function (photos) {
                return photos.rows.map(function (val) {
                    return val.doc;
                });
            })
            .catch(function (err) {
                console.error(err);
            });
    }

    function putPhoto(photo, userGuid) {
        return putDoc(photo, 'photo', userGuid);
    }

    function putDoc(doc, type, userGuid) {
        var today = new Date();
        if (userGuid === undefined) {
            return getUserGuid()
                .then(function (guid) {
                    doc._id = type + "_" + guid.value + '_' + today.getTime();
                    return db.put(doc)
                });
        } else {
            doc._id = type + "_" + userGuid + '_' + today.getTime();
            return db.put(doc)
        }
    }

    function getDoc(guid, type) {
        if (guid === undefined) {
            return db.allDocs({
                include_docs: true,
                attachments: true,
                startkey: type + "_",
                endkey: type + '_\uffff',
                binary: true
            })
        } else {
            return db.allDocs({
                include_docs: true,
                attachments: true,
                startkey: type + "_" + guid + '_',
                endkey: type + "_" + guid + '_\uffff',
                binary: true
            })
        }
    }
}();