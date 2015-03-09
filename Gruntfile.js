/**
* GruntFile for Adok
**/

var path = require('path');
var fs = require('fs');


module.exports = function(grunt) {

	//-> Load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//-> Grunt config
	grunt.initConfig({

		//-> Read package.json
		pkg: grunt.file.readJSON('package.json'),

		//-> for running tasks concurrently (instead of sequentially)
		concurrent: {
			dev: {
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		//-> utility that will monitor for any changes in your source
		//-> and automatically restart your server
		nodemon: {
			dev: {
				options: {
					file: 'app.js',
					ignoredFiles: [
						'.sass-cache/**',
						'components/**',
						'locales/**',
						'node_modules/**',
						'public/css',
						'public/layouts',
						'public/less',
						'public/medias',
						'public/views',
						'schema/**',
						'uploads/**'
					],
					watchedExtensions: ['js']
				}
			}
		},

		//-> middleware SASS - compass
		compass: {
			dist: {
				options: {
					sassDir: 'public/CssApp',
					cssDir: 'public/css',
					config: 'config.rb',
        			outputStyle: 'expanded',
        			debugInfo : false,
        			relativeAssets: false,
                    noLineComments: true
				}
			}
		},

		//-> it allows you to do a number of other things
		//-> including running various grunt tasks.
		watch: {
			compass: {
                files: ['public/CssApp/main.scss', 'public/CssApp/components.scss',
                		'public/CssApp/scss/**/*.scss'],
                tasks: ['compass']
            },
			livereload: {
				files: ['public/css/*.css'],
				options: { livereload: true }
			},
			clientJS: {
				 files: [
					'public/layouts/**/*.js', '!public/layouts/**/*.min.js',
					'public/adok_components/**/*.js', '!public/adok_components/**/*.min.js',
					'public/views/**/*.js', '!public/views/**/*.min.js'
				 ],
				 tasks: ['newer:uglify']
			}
		},

		//-> minify files
		uglify: {
			options: {
				mangle: false,
				sourceMapRoot: '/',
				sourceMapPrefix: 1,
				sourceMap: function(filePath) {
					return filePath.replace(/.js/, '.js.map');
				},
				sourceMappingURL: function(filePath) {
					return path.basename(filePath) +'.map';
				}
			},
			layouts: {
				files: {
					'public/layouts/components.min.js': [
						'public/components/jquery/dist/jquery.min.js',
						'public/components/jquery-ui/jquery-ui.min.js',
						'public/components/jquery.ui.touch-punch.dk/jquery.ui.touch-punch.dk.js',
						'public/components/underscore/underscore.js',
						'public/components/backbone/backbone.js',
						'public/components/velocity/velocity.min.js',
						'public/components/velocity/velocity.ui.min.js',
						'public/adok_components/velocity/sequences.js',
						'public/adok_components/FormFF/modernizr.custom.js',
						'public/components/i18next/i18next.min.js',
						'public/components/humane/humane.min.js',
						'public/components/moment/moment.js',
						'public/components/pikaday/pikaday.js',
						'public/components/pikaday/plugins/pikaday.jquery.js',
						'public/components/outdated-browser/outdatedbrowser/outatedbrowser.js',
						'public/components/webshim/js-webshim/minified/polyfiller.js',
						'public/adok_components/ripple/ripple.js',
						'public/adok_components/FormFF/classie.js',
						'public/adok_components/FormFF/FormFF.js',
						'public/components/iscroll/build/iscroll.js',
						'public/tools/CalcDistLatLong.js',
						'public/components/noty/js/noty/packaged/jquery.noty.packaged.min.js',
						'public/layouts/core.js'
					],
					'public/layouts/ie-sucks.min.js': [
						'public/components/html5shiv/dist/html5shiv.js',
						'public/components/respond/dest/respond.src.js',
						'public/components/webshim/js-webshim/minified/polyfiller.js'
					],
					'public/layouts/admin.min.js': [
						'public/layouts/core.js',
						'public/layouts/admin.js'
					]
				}
			},
			views: {
				files: [{
					expand: true,
					cwd: 'public/views/',
					src: ['**/*.js', '!**/*.min.js'],
					dest: 'public/views/min/',
					ext: '.min.js'
				}]
			}
		},

		//-> Clean files and folders
		clean: {
			js: {
				src: [
					'public/layouts/**/*.min.js',
					'public/layouts/**/*.min.js.map',
					'public/views/**/*.min.js',
					'public/views/**/*.min.js.map'
				]
			},
			css: {
				src: [
					'public/layouts/**/*.min.css',
					'public/views/**/*.min.css',
					'public/css/**/*.css',
					'.sass-cache/**'
				]
			}
		}
	});
	//-> End Of Grunt config

	//-> Register Task for Grunt
	grunt.registerTask('default', ['newer:uglify', 'compass:dist', 'concurrent']);
	grunt.registerTask('build', ['uglify', 'compass:dist']);
	grunt.registerTask('cleaner', ['clean']);
};
