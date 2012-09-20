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

## TODO

- Documentation
- actual tests
- maybe support weird encodings
- publish to npm
