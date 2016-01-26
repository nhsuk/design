module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    nodemon: {
      dev: {
        script: 'app.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'assets/css/main.css': 'assets/scss/main.scss'
        }
      }
    },

    watch: {
			css: {
				files: '**/*.scss',
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

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', ['concurrent:target']);

};
