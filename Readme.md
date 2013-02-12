csv-stream
===

Parses csv files. Accepts options. Handles weird encodings. That's all.

## Installation

```
not quite yet
```

## Usage

```javascript
var csv = require('csv-stream'),
    fs = require('fs')

var fstream = fs.createReadStream('/path/to/file'),
    parser = csv(options /* optional */, callback /* optional */)

// emits each row as an array of fields and its number
parser.on('data', function (row, rowNo) {
  // do stuff with data as it comes in
})

// AND/OR
function callback(err, doc) {
  if (err) throw err

  // doc is an array of row arrays
  doc.forEach(function (row) {})
}

// now pump some data into it
fstream.pipe(parser)

```
__Note:__ If you pass a callback to ```csv-stream``` it will buffer the parsed data for you and pass it to the callback when it's done. Unscientific tests showed a dramatic (2x) slowdown when using this on large documents.

### Options

You can pass some options to the parser. All of them are optional. Here are the defaults.

```javascript
{
  delimiter: ',', // comma, semicolon, whatever
  newline: '\n', // newline character
  quote: '\"', // what's considered a quote
  empty: '' // empty fields are replaced by this,
  encoding: '' // the encoding of the source, in case you need to convert it
}
```

## Performance

The unscientific tests mentioned above showed a throughput of ~20mb/s on a Macbook Pro 13" (mid 2010) when reading from disk.

## TODO

- more tests
- publish to npm
