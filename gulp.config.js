module.exports = function () {
    var root = './app/';
    var client = root + 'public/';
    var server = root + 'server/';
    var build = './build/';
    var config = {
        allJs: [
            root + '**/*.js'
        ],
        root: root,
        client: client,
        server: server,
        nodeServer: server + 'server.js',
        clientJs: [
            //root + '**/*.component.js',
            client + '**/*.js'
        ],
        scss: client + 'styles/**/*.scss',
        views: client + '**/*.jade',
        
        dest: {
            index: build + 'index.html',
            views: build + '**/*.html',
            css: build + 'css/',
            js: build + 'js/'
        },
        js: build + 'js/**/*.js',
        css: build + 'css/**/*.css',
        build: build,
        wiredepOptions: {
            bowerJson: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../bower_components'
        }

    };
    
    return config;
};