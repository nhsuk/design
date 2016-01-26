module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'app.js'
      }
    },

  });

  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('default', ['nodemon']);

};
