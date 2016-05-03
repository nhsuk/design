module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['assets/css'],

    nodemon: {
      dev: {
        script: 'app.js'
      }
    },

    sass: {
      dist: {
        options: {
          outputStyle: 'expanded',
          sourceMap: false
        },
        files: {
          'assets/css/main.css': 'assets/scss/main.scss'
        }
      }
    },

    watch: {
			css: {
				files: ['assets/scss/**/*.scss'],
				tasks: ['sass']
			}
		},

    concurrent: {
  		target: {
  			tasks: ['nodemon', 'watch'],
  			options: {
  				logConcurrentOutput: true
  			}
  		}
  	}

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('generate-assets', [
    'clean',
    'sass'
  ]);

  grunt.registerTask('default', [
    'generate-assets',
    'concurrent:target'
  ]);

};
