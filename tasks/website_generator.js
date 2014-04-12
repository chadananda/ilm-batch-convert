'use strict';
var path = require('path');
var child_process = require('child_process');
var async = require('async');
var ncp = require('ncp').ncp;

module.exports = function(grunt) {

  var copyAssets = function(outputFile, ctx, callback){
    var outputDir = path.join(path.dirname(outputFile), 'assets');
    var inputDir = ctx.assetsDir;
    ncp(inputDir, outputDir, { stopOnErr: true }, callback);
  };

  var processEachfile = function(file, ctx, callback){
    if( ctx.stopProcessing ) { callback(); return; }
    var inputFile = file.src[0];
    var outputFile = file.dest;
    grunt.log.writeln('Processing ' + inputFile);
    var process = child_process.spawn("node", [ctx.convertScript, inputFile, outputFile]); 
    process.stdout.on('data', grunt.log.write );
    process.stderr.on('data', grunt.log.error );
    process.on('close', function(code){
      if(code == 0 )  copyAssets(outputFile, ctx, callback);
      else callback('Process exited with error status ' + code);
    });
  };

  var onComplete = function(err, ctx, callback){
      if(err){
        ctx.failCount += 1;
        grunt.log.error( err.stack || err );
        if(ctx.stopOnError) ctx.stopProcessing = true;
      }else{
        ctx.successCount += 1;
      }
      callback();
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
    if( !ctx.assetsDir ){
        grunt.log.error('assetsDir option is not specified, its mandatory.'); 
        return false;
    }
    if( !grunt.file.isDir(ctx.assetsDir) ){
        grunt.log.error('assetsDir %s is not found or not a directory.', ctx.assetsDir); 
        return false;
    }
    var done = this.async();
    ctx.successCount = 0;
    ctx.failCount = 0;
    ctx.stopProcessing = false;
    async.eachSeries(this.files,
      function(file, callback){ //callback for each file
        processEachfile(file, ctx, function(err){ onComplete(err, ctx, callback) } ) 
      },
      function(){ //callback when every file is processed
          if( this.files.length > 1 ){
              grunt.log.writeln("Success : " + ctx.successCount);
              grunt.log.writeln("Fail : " + ctx.failCount);
          }
          done(ctx.failCount == 0);
      });
  });

};
