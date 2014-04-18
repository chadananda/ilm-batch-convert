/*jslint node: true */

"use strict";
var path = require("path");

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var outputDir = "Library-Output";
  grunt.initConfig({
    //specify the output directory
    outputDir: outputDir,

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
          convertScript : "convert.js",    //this script will be called for every input file
          stopOnError : true,              //stop grunt if any conversion fails
          assetsDir : 'Ilm-Convert/Assets' //source assets directory
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
        files: [ "<%=outputDir%>/**/*.{htm,html}" ],
        options: { livereload: true }
      }
    },

    //connect webserver to serve files
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          base: "<%=outputDir%>"
        }
      }
    },

    //generate index.html (master index file) based on Ilm-Convert/Templates/index.jade file
    jade: {
      compile: {
        options: {
          data: {
            indexfiles: grunt.file.expand( { cwd: outputDir }, "**/index.htm" )
          }
        },
        files: {
          "<%=outputDir%>/index.html": ["Ilm-Convert/Templates/index.jade"]
        }
      }
    }

  });

  //loads tasks defined in tasks directory
  grunt.loadTasks("tasks");

  //build output files only if input files are modified
  grunt.registerTask("build", ["newer:website_generator:all"]);

  //clean all output files, build everyting from scracth
  grunt.registerTask("rebuild", ["clean:all", "website_generator:all"]);

  //redbuild index.html in output directory
  grunt.registerTask("index", ["jade"]);

  //watch files, and serve files with livereload
  grunt.registerTask("live", ["connect:livereload", "watch"]);

  grunt.registerTask("default", ["build"]);
};
