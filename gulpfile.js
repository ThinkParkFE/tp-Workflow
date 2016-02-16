/*
 *
 * authors by 储涛 on 15/12/7.
 */

//引入插件
var gulp = require('gulp'),
    less = require('gulp-less'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    livereload = require('gulp-livereload'),
    copy = require('gulp-copy'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    cdn = require('gulp-cdn-replace'),
    manifest = require('gulp-manifest'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    revReplace = require('gulp-rev-replace'),
    rev = require('gulp-rev');

//默认配置
var config = {
    distPath: 'dist/',
    appPath: 'src/',
    default: '',
    cdn: 'http://images-menma-me.b0.upaiyun.com/yxh.realty.menma.me/microloushu/'
};


///清空图片、样式、js
gulp.task('del', function () {
    return del([config.distPath]);
});

//离线缓存
gulp.task('manifest', function () {
    gulp.src([
            "*.ico",
            config.distPath + 'assets/**/*.*'
        ], {base: './'})
        .pipe(manifest({
            cache: ["http://res.wx.qq.com/open/js/jweixin-1.0.0.js"],
            hash: true,
            preferOnline: false,
            network: ['*'],
            verbose: true,
            timestamp: true,
            filename: 'appcache.manifest',
            exclude: 'appcache.manifest'
        }))
        .pipe(gulp.dest(config.distPath + '/'));
});


//cdn
gulp.task('cdn', function () {
    gulp.src(config.appPath + '/*.html')
        .pipe(cdn({
            dir: config.appPath + '/',
            root: {
                js: config.cdn,
                css: config.cdn
            }
        }))
        .pipe(gulp.dest(config.appPath + '/'));
});


//livereload浏览器同步刷新
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(config.appPath + '/**/*.*', function (event) {
        livereload.changed(event.path);
    });
    gulp.watch(config.appPath + 'assets/less/*.less', ['less']);
});


//文件拷贝
gulp.task('copy', function () {
    //配置需要copy的文件
    //del([config.distPath]);
    return gulp.src(config.appPath + 'favicon.ico')
        .pipe(gulp.dest(config.distPath + '/'));
});


//配置copy多个文件但是路径不一样可这样配置
//gulp.task('list', ['copy'], function () {

//    return gulp.src([
//            config.appPath+'/tongji.php',
//            config.appPath+'/favicon.ico'
//    ])
//        .pipe(gulp.dest(config.distPath + '/'));
//});


//图片压缩
gulp.task('images', function () {
    return gulp.src(config.appPath + 'assets/images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.distPath + '/assets/images/'));

});


//Less编译
gulp.task('less', function () {

    return gulp.src(config.appPath + 'assets/less/app.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        //.pipe(gulp.dest(config.appPath + 'assets/styles'))
        .pipe(livereload())

        //根据设置浏览器版本自动处理浏览器前缀
        .pipe(postcss([autoprefixer({browsers: ["> 0%"]})]))
        .pipe(sourcemaps.write('.'))

        .pipe(gulp.dest(config.appPath + 'assets/styles'));

});


//文件合并压缩
gulp.task('js-css-merger', function () {

    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值
        removeEmptyAttributes: true,//删除所有空格作属性值
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面JS
        minifyCSS: false//压缩页面CSS
    };


    return gulp.src(config.appPath + '/*.html')

        .pipe(useref({
            cdnjs: function (a, b) {
                return '<script src="' + b + '"></script>';

            },
            cdncss: function (a, b) {

                return '<link  rel="stylesheet" href="' + b + '">';

            },
            transformPath: function (filePath) {
                var _filePath = filePath.split("?")
                if (_filePath.length > 1) {
                    return _filePath[0];
                }
                return filePath;
            }
        }))

        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.js', rev()))
        .pipe(gulpif('*.css', rev()))
        .pipe(gulpif('*.css', minifyCss({
            compatibility: "ie8,ie9,+selectors.ie7Hack,+properties.zeroUnits,+properties.urlQuotes,+properties.iePrefixHack"
        })))
        .pipe(gulpif('*.html', htmlmin(options)))
        .pipe(revReplace())
        //.pipe(revAll.revision())
        .pipe(gulp.dest(config.distPath))
});


gulp.task('dist', gulp.series('del', 'copy', 'images', 'js-css-merger'));


//gulp.task('default', ['less', 'watch']); //定义默认任务

//gulp.task('dist-cdn', ['del', 'copy', 'images', 'js-css-merger', 'cdn', 'manifest']); //项目定义dist-cdn压缩任务
//
//gulp.task('dist', [ 'copy', 'images', 'js-css-merger','js','css']); //项目dist压缩任务
