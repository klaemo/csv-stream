var assert = require('assert'),
    csv = require('../csv-stream'),
    fs = require('fs'),
    stdout = process.stdout
    
//var spec = require('stream-spec')

var fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv'),
    parser = csv(callback),
    start = Date.now()

function callback(err, doc) {
  if (err) throw err
  stdout.write('Should call back with entire parsed doc ')
  try {
    assert.equal(doc.length, 12)
    stdout.write('\u2713\n')
  } catch (err) {
    console.error(err)
  }
}
//spec(parser).through().validateOnExit()
fstream.pipe(parser)

var count = 0
parser.on('data', function (data, line) {
  count += 1
})

parser.on('end', function () {
  stdout.write('Should emit data once per line ')
  try {
    assert.equal(count, 12)
    stdout.write('\u2713\n')
  } catch (err) {
    console.error(err)
  }
  
  console.log('Time: ' + (Date.now() - start) + 'ms')
})



