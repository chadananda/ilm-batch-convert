'use strict';
var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    //specify the output directory
    outputDir: 'Library-Output',
    //clean all the output files
    clean: {
      all: {
        files: [
          { src: ["<%=outputDir%>/**", "!<%=outputDir%>"] }
        ]
      }
    },
    //configure website generator
    website_generator: {
      all: {
        options: {
          convertScript : 'convert.js',  //this script will be called for every input file
          stopOnError : true             //stop grunt if any conversion fails
        },
        files: [{ 
          expand: true,
          cwd: "Library",
          src: ["**/*.{txt,html}"],
          dest: '<%=outputDir%>',
          rename: function(dest, inputfile){
            //map input txt filename to output index.html filename
            //take input file path, delete extension with regex, add index.htm to the end 
            return path.join(dest, inputfile.replace(/\.[^\.\/\\]+$/,''), 'index.htm');
          }
        }]
      }
    },
    //watch and run generator automatically
    watch: {
      website_generator: {
        files: ["Library/**/*.{txt,html}"],
        tasks: ['newer:website_generator:all']
      }
    }
  });

  grunt.loadTasks('tasks'); //loads tasks defined in tasks directory
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');
  grunt.registerTask('build', ['newer:website_generator:all']);
  grunt.registerTask('rebuild', ['clean:all', 'website_generator:all']);
  grunt.registerTask('default', ['build']);
};
