var path = require('path');
var fs = require('fs');
var dot = require('dot');
var md = require('marked');
var langs = require('languages');


//Read Arguments
//argv[0] is node exe path
//argv[1] is current script path
var inputFile = process.argv[2];
var outputFile = process.argv[3];

//Conversion starts here inputFile -> outputFile
var content = fs.readFileSync(inputFile, 'binary').toString();

// Set up target document object
var doc = {
  meta: {},
  header: '',
  body: '',
  endmatter: '',
};

// Gather up metadata
doc.meta = metaData(inputFile, content);
if (doc.meta.hasJSON) content = content.replace(/\{\{[^}]+}}/g, '');
delete doc.meta.jasJSON;

// FILTER: remove tabs
content = content.replace(/\t/g, ' ');

// FILTER: fix smart quotes and m dash with unicode
content = textPretty(content);

// FILTER replace meta blocks with comments
content = content.replace(/=================================/, '<!--');
content = content.replace(/=================================/, '-->');

// FILTER replace old page markers <p#> and <c:#>
content = content.replace(/<p([0-9]+)>/g, "<span data-pg='$1'></span>");

// FILTER: markdown
md.setOptions({
  gfm: false, tables: false, breaks: false, pedantic: false,
  sanitize: false, smartLists: false, smartypants: false
});
content =  md(content);
content = content.replace(/<\/p>/g, "\n\n");

// FILTER add consistent header
doc.header = HTMLHeaderTemplate(doc.meta);

// FILTER: Number Paragraphs
content = numberPars(content, doc.meta);

// FILTER: HTML5 template
doc.body = content;
var outputHTML = HTML5Template(doc);


// OUTPUT
// first recursively create output directory if it doesn't exist
var mkdirp = function(dirname){
    if(fs.existsSync(dirname)) return;
    mkdirp(path.dirname(dirname));
    fs.mkdirSync(dirname);
};
mkdirp(path.dirname(outputFile));
// Output new file
fs.writeFileSync(outputFile, outputHTML);
console.log('[Converted] ' + outputFile);

//return 0 on success , non zero on any error, if script crashes, it will return non-zero value.
process.exit(0);







function HTML5Template(doc) {
  var out='<!DOCTYPE html>'+"\n"+'<html lang="'+(doc.meta.lang)+'"> '+"\n";
  out+= '<head> ' +"\n";
  out+= '<meta charset="utf-8"> '+"\n";
  out+= ' <title>'+(doc.meta.title)+'</title> '+"\n";
  Object.getOwnPropertyNames(doc.meta).forEach(function(val) {
    out+= ' <meta name="'+(val)+'" content="'+(doc.meta[val])+'"> '+"\n";
  });
  out+='</head>'+"\n";
  out+='<body> '+"\n";
  out+=' <div id="book-header">'+(doc.header)+'</div>'+"\n\n";
  out+=' <div id="book-body">'+"\n\n"+(doc.body)+"\n"+'</div>'+"\n\n";
  out+=' <div id="book-endmatter">'+(doc.endmatter)+'</div>'+"\n";
  out+='</body></html>';
  return out;
}

function HTMLHeaderTemplate(meta) { // just a sample, run this through internationalization later
  var header='';
  if (meta.title) header+= "<h1 id='title'>" + meta.title + "</h1> \n";
  if (meta.author) header+= "<h3 id='author'> By " + meta.author + "</h3> \n";
  if (meta.translator) header+= "<h4 id='translator'> Translated by " + meta.translator + "</h4> \n";
  if (meta.coverimage) header+= "<img id='coverimage' href='"+ meta.coverimage +"' /> \n";
  header+= "<hr class='underheader' />";
  return header;
}

function HTMLTOCTemplate(doc) {

}

function getLanguageCode(language) {
  var list = langs.getAllLanguageCode();
  for (var i in list) {
    var info = langs.getLanguageInfo(list[i]);
    if (info.name === language) return list[i];
  }
  return 'UNKNOWN';
}

function metaData(filepath, content) {
  var result = {};
  // first gather up path based meta data
  var items = filepath.split('/');
  result.language = items[1];
  result.bookshelf = items[2];
  result.author = items[items.length-2];
  result.title = path.basename(inputFile, path.extname(inputFile));
  result.inputFile = filepath;
  result.hasJSON = false;
  // Override if document has a JSON block
  if (content.indexOf('{{')>=0) {
    var meta_start = content.indexOf('{{');
    var meta_end = content.indexOf('}}');
    if (meta_start <50) {
      var obj = JSON.parse(content.substr(meta_start+1, (meta_end-meta_start)));
      Object.getOwnPropertyNames(obj).forEach(function(val) {
        result[val] = obj[val];
      });
      result.hasJSON = true;
    }
  }
  // calculate language medadata
  var languageCode = getLanguageCode(result.language);
  var languageInfo = langs.getLanguageInfo(languageCode);
  result.lang = languageCode;
  result.language = languageInfo.name;
  result.language_native = languageInfo.nativeName;
  result.language_direction = languageInfo.direction;

  return result;
}

function textPretty(a){
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/ -- /g, "--");                             // remove spaced around em-dashes
  a = a.replace(/--/g, "\u2014");                           // replace em-dashes
  return a;
}


function numberPars(content, meta){ // what about sections dude?
  var num = 1;
  var next = content.indexOf('<p data-num');
  if (next>0) num++;

  next = content.indexOf('<p>', next+1);
  while (next>0) {
    content = content.slice(0, next) + "<p id='"+num+"'>" +content.slice(next+3);
    num++;
    next = content.indexOf('<p>', next+1);
  }


  return content;
}

