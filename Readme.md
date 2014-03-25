csv-streamify [![Build Status](https://travis-ci.org/klaemo/csv-stream.png)](https://travis-ci.org/klaemo/csv-stream)
===

Parses csv files. Accepts options. Handles weird encodings. No coffee script, no weird APIs. Just streams. Tested against [csv-spectrum](https://github.com/maxogden/csv-spectrum) and used in production.

## Installation

```
npm install csv-streamify
```

## Usage

This module implements a simple node 0.10.x [stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream.

__Note:__ csv-streamify pulls in the ```readable-stream``` module, so it also works on node 0.8

```javascript
var csv = require('csv-streamify'),
    fs = require('fs')

var fstream = fs.createReadStream('/path/to/file'),
    parser = csv(options /* optional */, callback /* optional */)

// emits each line as a buffer or as a string representing an array of fields
parser.on('readable', function () {
  var line = parser.read()
  // do stuff with data as it comes in

  // current line number
  console.log(parser.lineNo)
})

// AND/OR
function callback(err, doc) {
  if (err) return handleErrorGracefully(err)

  // doc is an array of row arrays
  doc.forEach(function (row) { console.log(row) })
}

// now pump some data into it (and pipe it somewhere else)
fstream.pipe(parser).pipe(nirvana)

```
__Note:__ If you pass a callback to ```csv-streamify``` it will buffer the parsed data for you and pass it to the callback when it's done. This behaviour can obviously lead to out of memory errors with very large csv files.

### Options

You can pass some options to the parser. **All of them are optional**.

The options are also passed to the underlying transform stream, so you can pass in any standard node core stream options.

```javascript
{
  delimiter: ',', // comma, semicolon, whatever
  newline: '\n', // newline character (use \r\n for CRLF files)
  quote: '"', // what's considered a quote
  empty: '', // empty fields are replaced by this,
  
  // specify the encoding of the source if it's something other than utf8
  inputEncoding: '',

  // if true, emit arrays instead of stringified arrays or buffers
  objectMode: false,

  // if set to true, uses first row as keys -> [ { column1: value1, column2: value2 }, ...]
  columns: false
}
```

In order for the inputEncoding option to take effect you need to install [iconv-lite](https://github.com/ashtuchkin/iconv-lite) (`npm install iconv-lite --save`).
Also, take a look at the iconv-lite documentation for supported encodings.
(iconv-lite provides pure javascript character encoding conversion -> no native code compilation)

## CLI

To use on the command line install it globally:

```bash
$ npm install csv-streamify -g
```

This should add the `csv-streamify` command to your `$PATH`.

Then, you either pipe data into it or give it a filename:

```bash
# pipe data in
$ cat some_data.csv | csv-streamify
# pass a filename
$ csv-streamify some_data.csv > output.json
# tell csv-streamify to read from + wait on stdin
$ csv-streamify -
```

## Wishlist

- browser support

If you would like to contribute either of those just open an issue so we can discuss it further. :)

## Contributors

[Nicolas Hery](https://github.com/nicolashery) (objectMode)
