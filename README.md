# 'Ilm Batch Convert TXT->HTML,
### A Custom Grunt Build Script for Text Dcouments


Grunt is a great for Javascript builds. I especially like the 'watch' feature which allows watching live changes in a browser with the 'livereload' plugin. I've been using the Yeoman 'generator-webapp' Grunt script which has this already scaffolded out.

What I need is a custom Grunt build script (modified from 'generator-webapp') which will allow me to convert text files into HTML files. I will provide the actual conversion code but I need someone who is good with Grunt to help create the Grunt script.
 
### Full Description:

I have hundreds of book-sized plain text documents and want to create a Grunt web-development build process to convert to HTML5 and DB store the documents.  

I've been using various Yeoman generated Grunt configurations and they actually do a lot of what I want but I'm too novice to make many changes to Gruntfile.js without just breaking everything. What I have in mind could be a modified and extended version of the basic Yeoman "generator-webapp".

I just need a place where I can plug in my code for converting documents. The grunt commands I need are:

* grunt (default) - rebuild entire output folder, rebuild index file  
* grunt serve - open index file & watch for changes with LiveReload
        changes rebuild the changed document and the index file
* grunt deploy - push changed files to CouchDB

### Notes: 

*  You don't have to actually write the document conversion code, just the Grunt build & deploy processes, leaving a convenient way for me to add the complex conversion steps myself later. That could be one or more custom grunt tasks applied to all documents which I will extend later.

*  I'll want to be able to pull in other libraries to help me convert many document types such as .doc, .html, .epub, .jade, .md, .txt, .rtf, .pdf. I want it to be easy to add new conversion types as well as sub-types (such as a custom versions of text documents). Sub-types will be detected by the conversion script or determined by an optional metadata JSON file accompanying each document.

* I don't need testing frameworks, since these are just document conversions. You can yank all the moca and phantom stuff out (if you start from the Yeoman project "generator-webapp".)

* The build process should always generate a master index file which provides a file list of all documents so that one can find and view a specific document while editing. The build process should rebuild this file from a template in the app folder -- inserting a JSON object with an array of book metadata such as:

```
{ 
  documents: [
language: "English:en",   bookshelf: "Fiction",   title: "Moby-Dick",
author: "Herman Melville",   modified: "2013-08-31T09:05:07.740Z",
size: "102456",   crc32: "461707669",
uri: "English/Fiction/Herman Melville/Moby-Dick/index.html"
   ],
}
```

The idea is that I should be able to browse each book using the URI. All assets are stored as attachments in a single CouchDB record with the relative path as filename -- so links to resources inside the documents (pictures etc) do not need to be modified to be viewed online. The build script should not care where such files are located but simply move them to a parallel location in the document's output folder.

* Deploy to CouchDB:
* 
Each document gets two CouchDB JSON records. Only  changed files need be pushed to the DB.
1) One record contains all the standalone files as attachments (including the generated .html files).
2) A second record contains metadata for each document and a list of associated files from the first record (perhaps just a copy of the first record's _attachements block).
* Use a PouchDB wrapper to communicate with CouchDB (for consistency with my other code)
 
 
* Here's what I have in mind for organizational structure:

```
/ Library (nested source folder with lots of document types)
   / Language (eg. en)
        / Bookshelf (eg. Fiction)
            (any additional nesting from here ignored until final 'author' folder)
                   / Author (eg. Herman Melville) 
                         Book Title.txt
                         Book Title.json (optional JSON object to override path-inferred meta-data)
                         / Book Title (option additional assets for this document)
                               style.css (overrides "Common-Assets" in this example)
                               cover.png
                               style1.css
                               style2.sass
                               tools.js
                               intro-audio.mp3
                               
/ Library-Processed (mirrored folder with all processed  & HTML documents)
   index.html (linked list to all documents in Library-Processed)
   / Language (eg. en)
        / Bookshelf (eg. Fiction)
                / Author (eg. Herman Melville)
                        / Book Title (eg. Moby Dick)
                                index.html (after all custom processing steps)
                                / assets
                                        style.css (minified)
                                        cover.png (optimized)
                                        style1.css (minified)
                                        style2.css (converted then minified)
                                        tools.js (minified)
                                        intro-audio.mp3
                                        
/ IlmConverter (application)
      config.js (server access creds etc.)
      / Assets (whatever is here will be added to every document if not already provided)
           style.css
           logo.svg (converts to png)
           watermark-logo.png
      / Templates
           base.html (some form of templating)
        
```

