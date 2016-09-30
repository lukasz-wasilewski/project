var gulp = require('gulp'),
    del = require('del'),
    wiredep = require('wiredep').stream,
    config = require('./gulp.config')(),
    $ = require('gulp-load-plugins')({lazy: true}),
    browserSync = require('browser-sync');

var port = 3000;


gulp.task('default', ['help']);

gulp.task('help', function() {
    return $.taskListing();
});

gulp.task('hint', function(){
    return gulp.src(config.allJs)
        .pipe($.print())
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('clean', function(cb) {
    del(config.build).then(function(){
        cb();
    });
});

gulp.task('clean-style', function(cb) {
    del(config.dest.css).then(function(){
        cb();
    });
});

gulp.task('clean-html', function(cb) {
    del(config.dest.views).then(function(){
        cb();
    });
});

gulp.task('clean-js', function(cb) {
    del(config.dest.clientJs).then(function(){
        cb();
    });
});

gulp.task('sass', ['clean-style'], function(cb) {
    gulp.src(config.scss)
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.dest.css))
        .on('end', cb);
});

gulp.task('style-watch', function() {
    gulp.watch([config.scss], ['sass']);
});

gulp.task('jade', ['clean-html'], function(cb){
    gulp.src(config.views)
        .pipe($.print())
        .pipe($.jade({pretty: true}))
        .pipe(gulp.dest(config.build))
        .on('end', cb);
});

gulp.task('jade-watch', function() {
    gulp.watch([config.views], ['jade']);
});

gulp.task('js', ['clean-js'], function(cb){
    gulp.src(config.clientJs)
        .pipe(gulp.dest(config.build))
        .on('end', cb);
});

gulp.task('wiredep', [ 'sass', 'jade', 'js'], function(){
    gulp.src(config.dest.index)
        .pipe(wiredep(config.wiredepOptions))
        .pipe($.inject(gulp.src(config.js, {read: false}), {relative: true, removeTags: true}))
        .pipe($.inject(gulp.src(config.css, {read: false}), {relative: true, removeTags: true}))
        .pipe(gulp.dest(config.build));
});

gulp.task('html', ['wiredep'], function () {
    return gulp.src(config.dest.index)
        .pipe($.useref())
    .pipe(gulp.dest(config.build));
        //.pipe($.if('*.js', uglify()))
        //.pipe($.if('*.css', minifyCss()))
        
});

gulp.task('serv-dev', ['wiredep'], function(){
    var options = {
        script: config.nodeServer,
        delayTime: 1,
        watch: [ config.server ]
    }
    return $.nodemon(options)
                .on('start', function() {
                    startBrowserSync();
                })
                .on('restart', function() {
                    setTimeout(function() {
                        browserSync.notify('Reloading application..');
                        browserSync.reload({ stream:false });
                    }, 2000);
                });
});



function startBrowserSync() {
    if(browserSync.active) {
        return;
    }
    
    console.log('Start browser sync on port: ' + port);
    
    gulp.watch([config.scss, config.views, config.clientJs], ['wiredep']);
    
    var options = {
        proxy: 'localhost:' + port,
        port: 3001,
        files: [ 
            config.client + '**/*.*',
            '!' + config.scss,
            config.css,
            config.js,
            config.dest.views
        ],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        LogPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    }
    
    browserSync(options);
}
var childProcess = require('child_process');
var electron = require('electron');
gulp.task('start', function () {
    childProcess.spawn(electron, ['./app'], {
        stdio: 'inherit'
    })
    .on('close', function () {
        // User closed the app. Kill the host process.
        process.exit();
    });
});