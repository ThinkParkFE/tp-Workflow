/**
 * Created by hejun on 15/8/26.
 */

module.exports = function (grunt) {
    // Project configuration.
    var distPath = "dist/";
    var newtimestamp = "?" + (new Date()).getTime();
    var cdnbase='http://cdn/';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distPath: distPath,
        clean: {
            dist: [distPath + '**/**'],
            image: distPath + 'asstes/images/**/*.{png,jpg,jpeg,gif}',
            css: distPath + 'asstes/css/**/*.css',
            media: distPath + 'asstes/media/**/*',
            html: distPath + '**/*.html',
            tempclean: '.tmp'
        },
        copy: {
            buildoutimages: {
                expand: true,
                cwd: "app/",
                src: [
                    'assets/audio/bg.mp3',
                    'assets/fonts/*.ttf',
                    'lib/**',
                    'favicon.ico',
                    'index.{html.php}'
                ],
                dest: distPath,
                filter: 'isFile'
            },
            images:{
                expand: true,
                cwd: "app/",
                src: ['assets/images/**'],
                dest: distPath,
                filter: 'isFile'
            }
        },
        less: {
            development: {
                options:{
                    relativeUrls:true,
                    strictImports : true,
                    sourceMap: true,
                    sourceMapFilename:"app.css.map"
                },
                files: {
                    'app/assets/css/app.css':'app/assets/less/app.less'
                }
            },
            build: {
                options:{
                    relativeUrls:true
                },
                files: {
                    '.tmp/assets/css/app.css':'app/assets/less/app.less'
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments:true,
                shorthandCompacting: false,
                advanced           : false,
                roundingPrecision  : -1,
                noAdvanced         : true //取消高级特性
            },

            build: {
                files: {
                    'dist/assets/css/app.min.css': ['.tmp/assets/css/app.css']
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 versions']
            },
            development:{
                files: {
                    'app/assets/css/app.css': ['app/assets/css/app.css']
                }
            },
            build: {
                files: {
                    '.tmp/assets/css/app.css': ['.tmp/assets/css/app.css']
                }
            }
        },
        cdnify: {
            cssbulid:{
                options: {
                    rewriter: function (url) {

                        //console.log(url);
                        if(url.indexOf(".ttf")>=0||url.indexOf('data:') === 0){
                            return url;
                        }else{
                            //console.log(cdnbase+url.replace("../","assets/"));
                            return cdnbase+url.replace("../","assets/");
                        }
                    }
                },
                files: {
                    ".tmp/assets/css/app.css":".tmp/assets/css/app.css"
                }
            },
            htmlbulid: {
                options: {
                    base: cdnbase,
                    html: {
                        'img[src]': 'src', // cdnify  images
                        'script[src]': false, // don't cdnify script tags
                        'link[rel=stylesheet]': false, // don't cdnify link tags
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: '**/*.html',
                    dest: 'dist'
                }]
            }
        },

        //js压缩
        uglify: {
            options: {
                //sourceMap: true,
                ASCIIOnly: true,
                mangle: true
            },
            bulid: {
                files: [
                    {
                        dest: distPath + 'assets/js/app.min.js',
                        src: ['.tmp/concat/assets/js/app.min.js']
                    }
                ]
            }
        },
        //文件合并
        concat: {
            options: {
                separator: ';'
            },
            bulid: {
                files: [
                    {
                        src: ["bower_components/animate.css/animate.min.css"],
                        dest: distPath + 'assets/css/animate.min.css'
                    },
                    {
                        src: ["bower_components/tp.zepto/zepto.min.js"],
                        dest: distPath + 'assets/js/zepto.min.js'
                    },
                    {
                        src: [
                            "bower_components/tp.motion/pc-prompt.min.js",
                            "bower_components/tp.motion/landscape.min.js",
                            "bower_components/tp.motion/slide.min.js"
                        ],
                        dest: distPath + 'assets/js/motion.min.js'
                    },
                    {
                        src: [
                            'bower_components/tp/js/share.js',
                            'bower_components/tp/js/statistics.js',
                            'bower_components/tp/js/audioCtrl.js',
                            'app/assets/js/app.js'
                        ],
                        dest: '.tmp/concat/assets/js/app.min.js'
                    }
                ]
            }
        },
        //html代码压缩
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: false,
                    removeComments: true
                },
                files: [{
                    expand: false,
                    src: distPath + 'index.html',
                    dest: distPath + 'index.html'
                },
                    {
                        expand: false,
                        src: distPath + 'index.php',
                        dest: distPath + 'index.php'
                    }]
            }
        },
        useminPrepare: {
            html: distPath + 'index.{html,php}',
            options: {
                dest: distPath
            }
        },
        usemin: {
            html: distPath + 'index.{html,php}',
            options: {
                //blockReplacements: {
                //    css: function (block) {
                //        return '<link rel="stylesheet" href="' + block.dest + newtimestamp + '">';
                //    },
                //    js: function (block) {
                //        return '<script src="' + block.dest + newtimestamp + '"></script>';
                //    }
                //}
            }
        },
        manifest: {
            generate: {
                options: {
                    basePath: distPath,
                    //cache: ["assets/js/zepto.min.js","assets/js/app.min.js", "assets/css/app.min.css"],
                    cache: ["http://res.wx.qq.com/open/js/jweixin-1.0.0.js"],
                    network: ["*"],
                    fallback: [""],
                    //exclude     : ["assets/js/zepto.min.js"],
                    preferOnline: false,
                    verbose: true,
                    timestamp: true,
                    prefixer: distPath
                },
                src: [
                    "**/*.*"
                ],
                dest: distPath + 'manifest.appcache'
            }
        },
        watch: {
            less: {
                files: ['app/assets/less/app.less'],
                tasks: ['less:development','autoprefixer:development']
            }
        }
    });



    require('time-grunt')(grunt);
    //自动加载需要的grunt插件
    require('load-grunt-tasks')(grunt);


    grunt.registerTask('build-dist', [
        'clean:dist',
        'copy',
        'concat',
        'less:build',
        'autoprefixer:build',
        'cssmin',
        'uglify',
        'useminPrepare',
        'usemin',
        'htmlmin',
        'manifest',
        'clean:tempclean'

    ]);
    grunt.registerTask('build-dist-cdn', [
        'clean:dist',
        'copy:buildoutimages',
        'concat',
        'less:build',
        'autoprefixer:build',
        'cdnify',
        'cssmin',
        'uglify',
        'useminPrepare',
        'usemin',
        'htmlmin',
        'manifest',
        'clean:tempclean'
    ]);
    grunt.registerTask('default', ['watch:less']);
};