/*jshint undef:false */
var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs')

var fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv'),
    start = Date.now(),
    tests = {}

describe('without callback', function() {
  it('should emit data once per line', function (done) {
    var count = 0,
        parser = csv(),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    parser.on('readable', function () {
      assert(Array.isArray(JSON.parse(parser.read())))
      assert.equal(parser.lineNo, count);
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 12)
      assert.equal(parser.lineNo, 12)
      done()
    })

    fstream.pipe(parser)
  })
})

describe('with callback', function() {
  it('should callback with entire parsed document', function (done) {
    var parser = csv(cb),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    function cb (err, doc) {
      if (err) throw err

      assert(Array.isArray(doc))
      assert.equal(doc.length, 12)

      done()
    }

    fstream.pipe(parser)
  })
})

describe('quoted', function() {
  it('should handle quoted sequences', function (done) {
    var parser = csv(cb),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    function cb (err, doc) {
      if (err) throw err

      assert.equal(doc[1][1], 'Etiketten, "Borthener Obst" - A4 (Neutral)')

      done()
    }

    fstream.pipe(parser)
  })
})

describe('encoding', function() {
  it('should convert encoding options is set', function (done) {
    var parser = csv({ encoding: 'latin1' }, cb),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    function cb (err, doc) {
      if (err) throw err

      assert.equal(doc[5][1], 'Gröger')
      assert.equal(doc[7][1], '1 - 4/- Blätter(R505)')

      done()
    }

    fstream.pipe(parser)
  })

  it('should not convert encoding if option is not set', function (done) {
    var parser = csv(cb),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    function cb (err, doc) {
      if (err) throw err

      assert.notEqual(doc[5][1], 'Gröger')
      assert.notEqual(doc[7][1], '1 - 4/- Blätter(R505)')

      done()
    }

    fstream.pipe(parser)
  })
})

describe('object mode', function() {
  it('should stream one array per line', function (done) {
    var count = 0,
        parser = csv({objectMode: true}),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    parser.on('readable', function () {
      assert(Array.isArray(parser.read()))
      assert.equal(parser.lineNo, count);
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 12)
      assert.equal(parser.lineNo, 12)
      done()
    })

    fstream.pipe(parser)
  })
})
