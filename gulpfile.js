/*
 *
 * authors by 储涛 on 15/12/7
 * version 1.1.4
 */

//引入插件
var gulp = require('gulp'),
    less = require('gulp-less'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    livereload = require('gulp-livereload'),
    copy = require('gulp-copy'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    cdn = require('gulp-cdn'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    revReplace = require('gulp-rev-replace'),
    pi = require('gulp-load-plugins')(),
    rev = require('gulp-rev'),
    spriter = require('gulp-css-spriter'),
    pxtorem = require('gulp-pxtorem'),
    webpCss = require('gulp-webp-css'),
    webp = require('gulp-webp');



//默认配置
var config = {
    distPath: 'dist/',
    appPath: 'src/',
    less: 'src/assets/less/*.less',
    cssPath: 'src/assets/style/',
    origin: ''
};


//生成雪碧图
gulp.task('sprites', function () {
    return gulp.src(config.src + 'css/app.css')
        .pipe(spriter({
            'spriteSheet': config.dist + 'img/sprites.png',
            'pathToSpriteSheetFromCSS': 'img/sprites.png'
        }))
        .pipe(gulp.dest(config.dist));
});



//生成webp文件
gulp.task('webp', function () {
    return gulp.src(config.appPath + 'assets/images/*.*')
        .pipe(webp())
        .pipe(gulp.dest(config.distPath + 'assets/images/'))
});


//添加兼容webp样式
gulp.task('webpCss', function () {
    return gulp.src(config.distPath + 'assets/style/*.css')
        .pipe(webpCss())
        .pipe(gulp.dest(config.distPath + 'assets/style/'))
});


//px转换rem
gulp.task('pxtorem', function () {
    return gulp.src(config.appPath + 'assets/style/*.css')
        .pipe(pxtorem())
        .pipe(gulp.dest(config.appPath + 'assets/style/'));
});


//清空图片、样式、js
gulp.task('del', function () {
    return del([config.distPath]);
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


//文件拷贝
gulp.task('copy', function () {
    return gulp.src([
        config.appPath + '/favicon.ico',
        config.appPath + '/assets/images/**/**',
        config.appPath + '/assets/tpl/*.html'
    ], {base: config.appPath + '/'})
        .pipe(gulp.dest(config.distPath + '/'));
});


//监控任务
gulp.task('watch', function () {
    //pi.livereload.listen();
    //gulp.watch(config.appPath + '/**/*.*', function (event) {
    gulp.watch(config.appPath + 'assets/less/*.less', function (event) {
        // livereload.changed(event.path);
    });
    gulp.watch(config.less, gulp.series('less'));
});


//编译less
gulp.task('less', function () {
    return gulp.src(config.less)
        .pipe(sourcemaps.init())//生成maps文件
        .pipe(pi.less())//编译less
        .pipe(postcss([autoprefixer({browsers: ["> 0%"]})]))//自动添加浏览器前缀
        .pipe(sourcemaps.write('.'))//生成maps文件目录
        .pipe(gulp.dest(config.cssPath))//生成的css目录
        .pipe(pi.livereload());
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


//cdn加速
gulp.task('cdn-html', function () {
    return gulp.src([
        config.distPath + "*.html"
    ])
        .pipe(cdn({
            domain: "assets/",
            cdn: config.origin
        }))
        .pipe(gulp.dest(config.distPath + "/"))
});


//资源内联
gulp.task('inline', function () {
    return gulp.src(config.distPath + '/*.html')
        .pipe(pi.inline({
            base: './',
            disabledTypes: ['img']
        }))
        .pipe(gulp.dest(config.distPath));
});


//default
gulp.task('default', gulp.series('watch', 'less')); //定义默认任务

//dist
gulp.task('dist', gulp.series('del', 'copy', 'js-css-merger', 'pxtorem'));


gulp.task('test-dist', gulp.series('del', 'webp', 'copy', 'pxtorem', 'js-css-merger', 'webpCss'));

// cdn-dist
gulp.task('dist-cdn', gulp.series('del', 'copy', 'js-css-merger', 'cdn-html'));
