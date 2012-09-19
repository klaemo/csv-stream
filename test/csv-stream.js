var assert = require('assert'),
    csv = require('../csv-stream'),
    fs = require('fs')

var fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv'),
    parser = csv(),
    start = Date.now()

fstream.pipe(parser)

parser.on('data', function (data, line) {
  console.log(line)
})
parser.on('end', function () {
  console.log('Time: ' + (Date.now() - start) + 'ms')
})



