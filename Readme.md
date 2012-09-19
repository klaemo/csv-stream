csv-stream
===

Behaves as a through stream. Pipe-able. Docs follow soon...

## Usage

```javascript
var csv = require('csv-stream'),
    fs = require('fs')

var fstream = fsCreateReadStream('/path/to/file'),
    parser = csv(/* options */)

fstream.pipe(parser)

// emits the current line as an array and the line number
parser.on('data', function (data, lineNo) {
  // do stuff with data
})

```

## TODO

- Documentation
- actual tests
- maybe support weird encodings
- publish to npm
