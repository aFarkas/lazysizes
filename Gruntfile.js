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
				},
				plugins: {
					files: [{
						expand: true,
						cwd: 'plugins/',
						src: ['**/*.js', '!*.min.js', '!**/*.min.js'],
						dest: 'plugins/',
						ext: '.min.js',
						extDot: 'last'
					}]
				}
			},
			jshint: {
				all: {
					options: {
						jshintrc: true
					},
					src: [ "lazysizes.js", "plugins/**/*.js", "!*.min.js", "!plugins/**/*.min.js" ] //, "Gruntfile.js", "tests/*.js"
				}
			},
			plato: {
				all: {
					files: {
						"plato-report/": ["lazysizes.js", "plugins/**/*.js", "!*.min.js", "!plugins/**/*.min.js"]
					}
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
						'assets/css/tidy.css': ['index.html', 'maxdpr/*.html']
					}
				}
			},
			maxFilesize: {
				options: {
					// Task-specific options go here.
				},
				minified: {
					options: {
						maxBytes: (1024 * 5.7)
					},
					src: ["lazysizes.min.js"]
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-jshint");
		grunt.loadNpmTasks("grunt-contrib-uglify");
		grunt.loadNpmTasks("grunt-contrib-watch");
		grunt.loadNpmTasks('grunt-uncss');
		grunt.loadNpmTasks('grunt-bytesize');
		grunt.loadNpmTasks('grunt-max-filesize');
		grunt.loadNpmTasks('grunt-plato');


		// Default task.
		grunt.registerTask("default", [ "test", "uglify", "bytesize", "maxFilesize" ]);
		grunt.registerTask("test", [ "jshint" ]);
	};
})();
