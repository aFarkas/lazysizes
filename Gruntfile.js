/*global module:true*/
(function () {
	"use strict";

	var pkg;

	module.exports = function (grunt) {

		// Project configuration.
		grunt.initConfig({
			// Metadata.
			pkg: pkg = grunt.file.readJSON("package.json"),
			banner: "/*! <%= pkg.name %> - v<%= pkg.version %> */\n",
			// Task configuration.
			jshint: {
				all: {
					options: {
						jshintrc: true
					},
					src: [ "lazysizes.js", "plugins/**/*.js", "!*.min.js", "!plugins/**/*.min.js" ] //, "Gruntfile.js", "tests/*.js"
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-jshint");

		// Default task.
		grunt.registerTask("default", [ "test"]);
		grunt.registerTask("test", [ "jshint" ]);
	};
})();
