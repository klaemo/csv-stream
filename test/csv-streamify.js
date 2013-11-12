/*jshint undef:false */
var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs')

var fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv'),
    start = Date.now(),
    tests = {}

describe('without callback', function() {
  it('should emit a buffer containing one line', function (done) {
    var count = 0,
        parser = csv(),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    parser.on('readable', function () {
      var chunk = parser.read()
      assert(Buffer.isBuffer(chunk))
      assert(Array.isArray(JSON.parse(chunk)))
      assert.equal(parser.lineNo, count)
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
      done()
    })

    fstream.pipe(parser)
  })

  it('should emit a string containing one line', function (done) {
    var count = 0,
        parser = csv({ encoding: 'utf8' }),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    parser.on('readable', function () {
      var chunk = parser.read()
      assert(typeof chunk === 'string')
      assert(Array.isArray(JSON.parse(chunk)))
      assert.equal(parser.lineNo, count)
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
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
      assert.equal(doc.length, 13)

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
  it('should convert encoding if option is set', function (done) {
    var parser = csv({ inputEncoding: 'latin1' }, cb),
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

describe('newline', function () {
  it('should parse CRLF files', function (done) {
    var count = 0,
        parser = csv({ newline: '\r\n' }),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote-crlf.csv')

    parser.on('readable', function () {
      var chunk = parser.read()
      assert(Buffer.isBuffer(chunk))
      assert(Array.isArray(JSON.parse(chunk)))
      assert.equal(parser.lineNo, count)
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
      done()
    })

    fstream.pipe(parser)
  })
})

describe('object mode', function() {
  it('should stream one array per line', function (done) {
    var count = 0,
        parser = csv({ objectMode: true }),
        fstream = fs.createReadStream(__dirname + '/fixtures/quote.csv')

    parser.on('readable', function () {
      assert(Array.isArray(parser.read()))
      assert.equal(parser.lineNo, count)
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
      done()
    })

    fstream.pipe(parser)
  })
})
