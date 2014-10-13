/*global module:true*/
(function () {
	"use strict";

	var pkg;

	module.exports = function (grunt) {

		// Project configuration.
		grunt.initConfig({
			// Metadata.
			pkg: pkg = grunt.file.readJSON("bower.json"),
			banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
				"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
				" Licensed <%= pkg.license %> */\n",
			// Task configuration.
			uglify: {
				options: {
					banner: "<%= banner %>",

					compress: {
						dead_code: true
					}
				},

				main: {
					src: [ "lazysizes.js" ],
					dest: "lazysizes.min.js"
				}
			},
			jshint: {
				all: {
					options: {
						jshintrc: true
					},
					src: [ "lazysizes.js" ] //, "Gruntfile.js", "tests/*.js"
				}
			},
			watch: {
				gruntfile: {
					files: [ "Gruntfile.js", "lazysizes.js" ],
					tasks: [ "default" ]
				}
			},
			bytesize: {
				all: {
					src: [ "lazysizes.min.js" ]
				}
			},
			uncss: {
				dist: {
					files: {
						'assets/css/tidy.css': ['index.html']
					}
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-jshint");
		grunt.loadNpmTasks("grunt-contrib-uglify");
		grunt.loadNpmTasks("grunt-contrib-watch");
		grunt.loadNpmTasks('grunt-uncss');
		grunt.loadNpmTasks('grunt-bytesize');


		// Default task.
		grunt.registerTask("default", [ "test", "uglify", "bytesize" ]);
		grunt.registerTask("test", [ "jshint" ]);
	};
})();
