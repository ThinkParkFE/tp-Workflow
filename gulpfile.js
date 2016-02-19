/*
 *
 * authors by 储涛 on 15/12/7
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
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    revReplace = require('gulp-rev-replace'),
    qn = require('gulp-qn'),
    upyunDest = require('gulp-upyun').upyunSrc,
    pi = require('gulp-load-plugins')(),
    rev = require('gulp-rev');

//默认配置
var config = {
    distPath: 'dist/',
    appPath: 'src/',
    less: 'src/assets/less/*.less',
    cssPath: 'src/assets/styles/',
    qncss: 'dist/assets/styles/*.css',
    qnjs: 'dist/assets/scripts/*.js',
    qnimages: 'dist/assets/images/*.**',
    qnaduio: 'dist/assets/audio/*.mp3',
    qnmedia: 'dist/assets/media/*.mp4',
    cdn: 'http://images.menma.me/yxh.realty.menma.me/microloushu/assets/'
};


//清空图片、样式、js
gulp.task('del', function () {
    return del([config.distPath]);
});


//文件拷贝
gulp.task('copy', function () {
    return gulp.src(config.appPath + 'favicon.ico')
        .pipe(gulp.dest(config.distPath + '/'));
});

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


//监控任务
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(config.appPath + '/**/*.*', function (event) {
        livereload.changed(event.path);
    });
    gulp.watch(config.less, gulp.series('less'));
});


//编译less
gulp.task('less', function () {
    return gulp.src(config.less).
    pipe(sourcemaps.init()).//生成maps文件
    pipe(pi.less()).//编译less
    pipe(postcss([autoprefixer({browsers: ["> 0%"]})])).//自动添加浏览器前缀
    pipe(sourcemaps.write('.')).//生成maps文件目录
    pipe(gulp.dest(config.cssPath)).//生成的css目录
    pipe(pi.livereload());//浏览器自动刷新

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

var qiniu = "";


//上传至七牛
gulp.task('push-qn', function () {

    qiniu = {
        accessKey: '5URrS0k6NPfCuHyrXkPO9d2JnJpJvWd39kwQkShj',
        secretKey: '8lTSOgmvBNe8kaBo_8ngBLdGYyPvqcilfBN42MB9',
        bucket: 'test',
        origin: 'http://7xqypv.com1.z0.glb.clouddn.com'
    };

    return gulp.src([
            config.qncss,
            config.qnjs,
            config.qnimages,
            config.qnaduio,
            config.qnmedia
        ])

        .pipe(qn({
            qiniu: qiniu
            //prefix: 'test'
        }))

        .pipe(cdn({
            domain: "assets/styles/",
            cdn: qiniu.origin
        }))
});

//替换静态cdn
gulp.task('qn-cdn', function () {

    return gulp.src(config.distPath + [
                '*.html'
            ])

        .pipe(cdn({
            domain: "assets",
            cdn: qiniu.origin
        }))

        .pipe(gulp.dest(config.distPath + "/"))
});

//cdn加速
gulp.task('cdn-html', function () {
    return gulp.src([
            config.distPath + "*.html"
        ])
        .pipe(cdn({
            domain: "assets/",
            cdn: config.cdn
        }))
        .pipe(gulp.dest(config.distPath + "/"))
});


gulp.task('cdn-css', function () {
    return gulp.src([
            config.distPath + "assets/styles/*.css"
        ])
        .pipe(cdn({
            domain: "../images/",
            cdn: config.cdn
        }))
        .pipe(gulp.dest(config.distPath + "assets/styles/"))
});


//gulp.task('upyun-upload', function () {
//
//    var folderOnUpyun = 'test/';
//    var options = {
//        username: 'mrleo',
//        password: 'woainict99'
//    };
//
//    return gulp.src(config.appPath + "/*.html")
//        .pipe(upyunDest(folderOnUpyun, options))
//
//});


//上传七牛替换远程cdn
//gulp.task('qn', gulp.series('push-qn', 'qn-cdn'));

// cdn路径替换
gulp.task('dist-cdn', gulp.series('del', 'copy', 'js-css-merger', 'cdn-html', 'cdn-css'));

//生成dist任务
gulp.task('dist', gulp.series('del', 'copy', 'images', 'js-css-merger'));//生成dist目录

//默认任务
gulp.task('default', gulp.parallel('less', 'watch')); //定义默认任务
