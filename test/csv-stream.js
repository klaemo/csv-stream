var assert = require('assert'),
    csv = require('../csv-stream'),
    fs = require('fs')
    
//var spec = require('stream-spec')

var fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv'),
    parser = csv(function (err, doc) {
      if (err) return console.error(err)
      console.log(doc)
    }),
    start = Date.now()

//spec(parser).through().validateOnExit()
fstream.pipe(parser)

parser.on('data', function (data, line) {
  console.log(line)
})
parser.on('end', function () {
  console.log('Time: ' + (Date.now() - start) + 'ms')
})



