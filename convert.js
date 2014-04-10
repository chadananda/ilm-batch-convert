var path = require('path');
var fs = require('fs');

//Read Arguments
//argv[0] is node exe path
//argv[1] is current script path
var inputFile = process.argv[2];
var outputFile = process.argv[3];

//recursively create output directory if it doesn't exist
var mkdirp = function(dirname){
    if(fs.existsSync(dirname)) return;
    mkdirp(path.dirname(dirname));
    fs.mkdirSync(dirname);
}
mkdirp(path.dirname(outputFile));

//Conversion starts here inputFile -> outputFile
var oldContent = fs.readFileSync(inputFile).toString();
var newContent = oldContent.toUpperCase();
fs.writeFileSync(outputFile, newContent);
console.log('[Converted] ' + outputFile);

process.exit(0); //return 0 on success , non zero on any error, if script crashes, it will return non-zero value.
