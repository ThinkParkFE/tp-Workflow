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
    cdn = require('gulp-cdn'),
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
    cdn: 'http://images.menma.me/yxh.realty.menma.me/microloushu/'
};


//清空图片、样式、js
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
                //console.log(filePath);
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
        .pipe(gulp.dest(config.distPath))
});


//cdn 任务
gulp.task('js-css-merger-cdn', function () {

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

    return gulp.src(config.appPath + '/test.html')

        .pipe(useref({
            cdnjs: function (a, b) {
                return '<script src="' + b + '"></script>';

            },
            cdncss: function (a, b) {

                return '<link  rel="stylesheet" href="' + b + '">';

            },
            transformPath: function (filePath) {
                console.log(filePath);
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
        .pipe(gulpif('test.html', htmlmin(options)))
        .pipe(revReplace())
        .pipe(gulp.dest(config.distPath))
});

//配置自动上传至七牛
//const qiniu_options = {
//    accessKey: 'xxx',
//    secretKey: 'xxx',
//    bucket: 'xxx',
//    domain: 'http://xxx.com'
//};
//
//
//gulp.task('publish-js', function () {
//    return gulp.src(['./build/js/*.js'])
//        .pipe(uglify())
//        .pipe(rev())
//        .pipe(gulp.dest('./build/js'))
//        .pipe(qn({
//            qiniu: qiniu_options,
//            prefix: 'js'
//        }))
//        .pipe(rev.manifest())
//        .pipe(gulp.dest('./build/rev/js'));
//});


//配置cdn
gulp.task('cdn', function () {
    return gulp.src(config.distPath + "test.html")

        .pipe(cdn({
            domain: "assets/",
            cdn: "http://cdn.socialpark.com.cn/"
        }))

        .pipe(gulp.dest(config.distPath + "/"))
});

gulp.task('dist-cdn', gulp.series('del', 'copy', 'js-css-merger-cdn', 'cdn'));
// cdn路径替换

gulp.task('dist', gulp.series('del', 'copy', 'images', 'js-css-merger'));//生成dist目录

gulp.task('default', gulp.series(['less', 'watch'])); //定义默认任务
