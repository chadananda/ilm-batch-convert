"use strict";
var path = require("path");

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    //specify the output directory
    outputDir: "Library-Output",
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
          convertScript : "convert.js",  //this script will be called for every input file
          stopOnError : true             //stop grunt if any conversion fails
        },
        files: [{ 
          expand: true,
          cwd: "Library",
          src: ["**/*.{txt,html}"],
          dest: '<%=outputDir%>',
          rename: function(dest, inputfile){
            //map input txt filename to output index.htm filename
            //take input file path, delete extension with regex, add index.htm to the end 
            return path.join(dest, inputfile.replace(/\.[^\.\/\\]+$/,""), "index.htm");
          }
        }]
      }
    },
    watch: {
      //watch input files and run generator automatically
      website_generator: {
        files: ["Library/**/*.{txt,html}"],
        tasks: ['newer:website_generator:all']
      },
      //watch output files and trigger connect server to reload
      livereload: {
        files: [ '<%=outputDir%>/**/*.{html,htm}' ],
        options: { livereload: true }
      }
    },
    //connect webserver to serve files
    connect: {
      livereload: {
        options: {
          port: 9000,
          open: true,
          hostname: "localhost",
          base: "<%=outputDir%>"
        }
      },
    }
  });
  grunt.loadTasks("tasks"); //loads tasks defined in tasks directory
  grunt.registerTask("build", ["newer:website_generator:all"]);
  grunt.registerTask("rebuild", ["clean:all", "website_generator:all"]);
  grunt.registerTask("default", ["build"]);
  grunt.registerTask("live", ["connect:livereload", "watch"]);
};
