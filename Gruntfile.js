/*global module:false*/
/*jslint stupid:true */

var async = require('async');
var fs = require('fs');
var path = require('path');
var less = require('less');
var util = require('util');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        component: grunt.file.readJSON('component.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> */\n',
        // Task configuration.
        component_build: {
            dist: {
                name: 'frontend',
                output: './build/',
                prefix: 'build',
                configure: function(rootBuilder) {
                    rootBuilder.copyFiles();
                    rootBuilder.hook('before styles', function(builder, callback) {
                        var files = builder.config.styles;
                        if (!files) {
                            return callback();
                        }
                        async.forEach(files, function(file, next) {
                            var fullname = builder.path(file);
                            var outFilename = path.basename(file, path.extname(file)) + '.css';
                            var string = fs.readFileSync(fullname, 'utf8');
                            var parser = new less.Parser({
                                filename: fullname,
                                paths: rootBuilder.globalLookupPaths
                            });
                            parser.parse(string, function(error, tree) {
                                if (error) {
                                    return callback(error);
                                }
                                var data = tree.toCSS();
                                builder.addFile('styles', outFilename, data);
                                builder.removeFile('styles', file);
                                next();
                            });
                        }, callback);
                    });
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: [
                    'js/app.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                force: true,
                globalstrict: true,
                globals: {
                    module: false,
                    require: false,
                    jQuery: false,
                }
            },
            test: {
                src: ['test/**/*.js']
            },
            dist: {
                src: ['app/**/*.js']
            }
        },
        watch: {
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
            component: {
                files: ['app/**/*', 'lib/**/*', 'index.*', 'component.json'],
                tasks: ['jshint:dist', 'component_build']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-component-build');

    // Default task.
    grunt.registerTask('default', ['jshint', 'component_build']);
};
