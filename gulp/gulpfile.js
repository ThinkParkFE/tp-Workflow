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
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    copy = require('gulp-copy'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    clean = require('gulp-clean'),
    cdn = require('gulp-cdn-replace'),
    manifest = require('gulp-manifest'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if');

//默认配置
var config = {
    distPath: 'dist/',
    appPath: 'app/',
    default: '',
    cdn: 'http://images-menma-me.b0.upaiyun.com/yxh.realty.menma.me/microloushu/'
};


///清空图片、样式、js
gulp.task('clean', function () {
    return gulp.src(config.distPath + '/', {read: false})
        .pipe(clean());
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
    gulp.src(config.appPath + 'assets/images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.distPath + '/assets/images/'));
});


//Less编译
gulp.task('less', function () {
    gulp.src(config.appPath + 'assets/less/app.less')
        .pipe(less())
        .pipe(gulp.dest(config.appPath + 'assets/css'))
        .pipe(livereload())

        //根据设置浏览器版本自动处理浏览器前缀
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: false //是否去掉不必要的前缀 默认：true
        }))

        .pipe(gulp.dest(config.appPath + 'assets/css'));
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
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulpif('*.html', htmlmin(options)))
        .pipe(gulp.dest(config.distPath + '/'))
});

gulp.task('default', ['less', 'watch']); //定义默认任务

gulp.task('dist-cdn', ['copy', 'images', 'js-css-merger', 'cdn', 'manifest']); //项目定义dist-cdn压缩任务

gulp.task('dist', ['copy', 'images', 'js-css-merger', 'manifest']); //项目dist压缩任务
