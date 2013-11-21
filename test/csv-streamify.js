var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs'),
    path = require('path'),
    fixture = path.join(__dirname, 'fixtures', 'quote.csv')

describe('without callback', function() {
  it('should emit a buffer per line (non-flowing-mode)', function (done) {
    var count = 0,
        parser = csv(),
        fstream = fs.createReadStream(fixture)

    parser.on('readable', function () {
      var chunk
      while (null !== (chunk = parser.read())) {
        assert(Buffer.isBuffer(chunk))
        assert(Array.isArray(JSON.parse(chunk)))

        assert.equal(parser.lineNo, count)
        count += 1
      }
    })

    parser.on('end', function () {
      assert.equal(parser.body.length, 0, 'should not buffer')
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
      done()
    })

    fstream.pipe(parser)
  })

  it('should emit a buffer per line (flowing-mode)', function (done) {
    var count = 0,
        parser = csv(),
        fstream = fs.createReadStream(fixture)

    parser.on('data', function (chunk) {
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
        fstream = fs.createReadStream(fixture)

    parser.on('data', function (chunk) {
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

  it('should emit a string containing one line (latin1)', function (done) {
    var count = 0,
        doc = [],
        parser = csv({ inputEncoding: 'latin1', encoding: 'utf8' }),
        fstream = fs.createReadStream(fixture)

    parser.on('data', function (chunk) {
      assert(typeof chunk === 'string')
      var json = JSON.parse(chunk)
      assert(Array.isArray(json))
      doc.push(json)
      assert.equal(parser.lineNo, count)
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      assert.equal(parser.lineNo, 13)
      assert.equal(doc[5][1], 'Gröger')
      assert.equal(doc[7][1], '1 - 4/- Blätter(R505)')
      done()
    })

    fstream.pipe(parser)
  })
})

describe('with callback', function() {
  it('should callback with entire parsed document', function (done) {
    var parser = csv(cb),
        fstream = fs.createReadStream(fixture)

    function cb (err, doc) {
      if (err) return done(err)
      assert(Array.isArray(doc))
      assert.equal(doc.length, 13)
      done()
    }

    fstream.pipe(parser)
  })
})

describe('encoding', function() {
  it('should convert encoding if option is set', function (done) {
    var parser = csv({ inputEncoding: 'latin1' }, cb),
        fstream = fs.createReadStream(fixture)

    function cb (err, doc) {
      if (err) return done(err)

      assert.equal(doc[5][1], 'Gröger')
      assert.equal(doc[7][1], '1 - 4/- Blätter(R505)')

      done()
    }

    fstream.pipe(parser)
  })

  it('should not convert encoding if option is not set', function (done) {
    var parser = csv(cb),
        fstream = fs.createReadStream(fixture)

    function cb (err, doc) {
      if (err) return done(err)

      assert.notEqual(doc[5][1], 'Gröger')
      assert.notEqual(doc[7][1], '1 - 4/- Blätter(R505)')

      done()
    }

    fstream.pipe(parser)
  })
})

describe('newline', function () {
  it('should respect options.newline', function (done) {
    var count = 0,
        parser = csv({ newline: '\r\n' }),
        fstream = fs.createReadStream(path.join(__dirname, 'fixtures', 'quote_crlf.csv'))

    parser.on('data', function (chunk) {
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
  it('should emit one array per line', function (done) {
    var count = 0,
        parser = csv({ objectMode: true }),
        fstream = fs.createReadStream(fixture)

    parser.on('data', function (chunk) {
      assert(Array.isArray(chunk))
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

describe('quirks', function () {
  it('should handle quoted empty cells', function (done) {
    var parser = csv({ columns: true }, function (err, res) {
      if (err) return done(err)
      assert.deepEqual(res, require('./fixtures/empty.json'))
      done()
    })

    fs.createReadStream(path.join(__dirname, 'fixtures', 'empty.csv'))
      .pipe(parser)
  })

  it('should handle quoted empty cells (CRLF)', function (done) {
    var parser = csv({ columns: true, newline: '\r\n' }, function (err, res) {
      if (err) return done(err)
      assert.deepEqual(res, require('./fixtures/empty.json'))
      done()
    })

    fs.createReadStream(path.join(__dirname, 'fixtures', 'empty_crlf.csv'))
      .pipe(parser)
  })
})
