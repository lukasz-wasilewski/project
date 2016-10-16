// server.js
module.exports = function (done) {
    // set up ========================
    var express = require('express');
    var app = express(); // create our app w/ express
    var morgan = require('morgan'); // log requests to the console (express4)
    var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var busboy = require('connect-busboy');
    // configuration =================
    app.use(express.static(__dirname + '/../node_modules'));
    app.use(express.static(__dirname + '/../public'));
    app.use(morgan('dev')); // log every request to the console
    app.use(bodyParser.json({
        limit: '50mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    }));
    app.use(bodyParser.json()); // parse application/json
    app.use(bodyParser.json({
        type: 'application/vnd.api+json'
    })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(busboy());

    var torrent = require('./routes')(app);

    // listen (start app with node server.js) ======================================
    app.listen(8080, function () {
        console.log("App listening on port 8080");
        done();
        /*
                setTimeout(function () {
                    torrent.torrent.share();
                }, 5000)*/
        /*
                setInterval(function () {
                    db.getAllUsers().then(function (profiles) {
                        for (var i = 0; i < profiles.rows.length; i++) {
                            torrent.torrent.runConsume(profiles.rows[i].doc.torrent_id);
                        }
                    });
                }, 30000);*/
    });
}