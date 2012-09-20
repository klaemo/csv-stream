csv-stream
===

Behaves as a through stream. Pipe-able. Docs follow soon...

## Usage

```javascript
var csv = require('csv-stream'),
    fs = require('fs')

var fstream = fs.createReadStream('/path/to/file'),
    parser = csv(options /* optional */, callback /* optional */)

// emits the current line as an array and the line number
parser.on('data', function (data, lineNo) {
  // do stuff with data
})

// AND/OR

parser = csv(/*options,*/ function (err, doc) {
  if (err) throw err

  // now you have the complete parsed document
  doc.forEach(function (line) {
    /* 
     * doc is an array of lines from the csv input
     * each line is itself an array of fields
     */
  })
})

// now pump some data into it
fstream.pipe(parser)

```
__Note:__ If you pass a callback to ```csv-stream``` it will buffer the parsed data for you and pass it to the callback when it's done. Unscientific tests showed a dramatic (2x) slowdown when using this on large documents.

## Performance

The same unscientific test showed a throughput of ~20mb/s on a Macbook Pro 13" (mid 2010) when reading from disk.

## TODO

- Documentation
- actual tests
- maybe support weird encodings
- publish to npm
