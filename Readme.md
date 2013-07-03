csv-streamify
===

Parses csv files. Accepts options. Handles weird encodings. No coffee script, no weird APIs. Just streams.

## Installation

```
npm install csv-streamify
```

## Usage

This module implements a simple node 0.10.x [stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream.

__Note:__ If you're still running node 0.8.x, you have to do ```npm install readable-stream```

```javascript
var csv = require('csv-streamify'),
    fs = require('fs')

var fstream = fs.createReadStream('/path/to/file'),
    parser = csv(options /* optional */, callback /* optional */)

// emits each row as a JSON.stringified array of fields
parser.on('readable', function () {
  var line = parser.read()
  // do stuff with data as it comes in
  // Array.isArray(JSON.parse(line)) === true

  // current line number
  console.log(parser.lineNo)
})

// AND/OR
function callback(err, doc) {
  if (err) throw err

  // doc is an array of row arrays
  doc.forEach(function (row) {})
}

// now pump some data into it (and pipe it somewhere else)
fstream.pipe(parser).pipe(nirvana)

```
__Note:__ If you pass a callback to ```csv-stream``` it will buffer the parsed data for you and pass it to the callback when it's done. Unscientific tests showed a dramatic (2x) slowdown when using this on large documents.

### Options

You can pass some options to the parser. All of them are optional. Here are the defaults.

```javascript
{
  delimiter: ',', // comma, semicolon, whatever
  newline: '\n', // newline character
  quote: '\"', // what's considered a quote
  empty: '', // empty fields are replaced by this,
  encoding: '', // the encoding of the source, in case you need to convert it
  objectMode: false // emit arrays instead of stringified arrays
}
```

In order for the encoding option to take effect you need to install the excellent [node-iconv](https://github.com/bnoordhuis/node-iconv) by node core contributor @bnoordhuis
Also, take a look at the node-iconv documentation for supported encodings.


## Performance

The unscientific tests mentioned above showed a throughput of ~20mb/s on a Macbook Pro 13" (mid 2010) when reading from disk.

## TODO

- more tests
