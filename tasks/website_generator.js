'use strict';
var path = require('path');
var child_process = require('child_process');
var async = require('async');

module.exports = function(grunt) {
  var processEachfile = function(file, callback, ctx){
    if( ctx.stopProcessing ) { callback(); return; }
    var inputFile = file.src[0];
    var outputFile = file.dest;
    grunt.log.writeln('Processing ' + inputFile);
    var process = child_process.spawn("node", [ctx.convertScript, inputFile, outputFile]); 
    process.stdout.on('data', grunt.log.write );
    process.stderr.on('data', grunt.log.error );
    process.on('close', function(code){
      if(code == 0){
        ctx.successCount += 1;
      }else{
        ctx.failCount += 1;
        if(ctx.stopOnError) ctx.stopProcessing = true;
      }
      callback();
    });
  };

  grunt.registerMultiTask('website_generator', 'converts txt files to websites', function() {
    var ctx = this.options({
        stopOnError : true
    });
    if( !ctx.convertScript ){
        grunt.log.error('convertScript option is not specified, its mandatory.'); 
        return false;
    }
    if( !grunt.file.exists(ctx.convertScript) ){
        grunt.log.error('convertScript %s is not found', ctx.convertScript); 
        return false;
    }
    var done = this.async();
    ctx.successCount = 0;
    ctx.failCount = 0;
    ctx.stopProcessing = false;
    async.eachSeries(this.files, 
      function(file, callback){ processEachfile(file, callback, ctx) },
      function(){
          if( ctx.stopProcessing || !ctx.stopOnError ){
              grunt.log.writeln("Success : " + ctx.successCount);
              grunt.log.writeln("Fail : " + ctx.failCount);
          }
          done(ctx.failCount == 0);
      });
  });

};
