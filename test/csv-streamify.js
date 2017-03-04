/* global describe, it */
'use strict'

var assert = require('assert')
var csv = require('../csv-streamify')
var fs = require('fs')
var path = require('path')
var fixture = path.join(__dirname, 'fixtures', 'quote.csv')
var str = require('string-to-stream')

describe('without callback', function () {
  it('should emit a buffer per line (non-flowing-mode)', function (done) {
    var parser = csv()
    var fstream = fs.createReadStream(fixture)

    var count = 0
    parser.on('readable', function () {
      var chunk
      while ((chunk = parser.read()) !== null) {
        assert(Buffer.isBuffer(chunk))
        assert(Array.isArray(JSON.parse(chunk)))

        count += 1
      }
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      done()
    })

    fstream.pipe(parser)
  })

  it('should emit a buffer per line (flowing-mode)', function (done) {
    var parser = csv()
    var fstream = fs.createReadStream(fixture)

    var count = 0
    parser.on('data', function (chunk) {
      assert(Buffer.isBuffer(chunk))
      assert(Array.isArray(JSON.parse(chunk)))

      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      done()
    })

    fstream.pipe(parser)
  })

  it('should emit a string containing one line', function (done) {
    var parser = csv({ encoding: 'utf8' })
    var fstream = fs.createReadStream(fixture)

    var count = 0
    parser.on('data', function (chunk) {
      assert(typeof chunk === 'string')
      assert(Array.isArray(JSON.parse(chunk)))
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      done()
    })

    fstream.pipe(parser)
  })
})

describe('with callback', function () {
  it('should callback with entire parsed document', function (done) {
    var parser = csv(cb)
    var fstream = fs.createReadStream(fixture)

    function cb (err, doc) {
      if (err) return done(err)
      assert(Array.isArray(doc))

      // test for crazy quoted sequences
      assert.equal(doc[1].length, 2)
      assert.deepEqual(doc[1], [
        'Job Description:', '"Etiketten", "Borthener Obst" - A4 (Neutral)'
      ])

      assert.equal(doc.length, 13)
      done()
    }

    fstream.pipe(parser)
  })
})

describe('newline', function () {
  it('should respect options.newline', function (done) {
    var parser = csv({ newline: '\r\n' })
    var fstream = fs.createReadStream(path.join(__dirname, 'fixtures', 'quote_crlf.csv'))

    var count = 0
    parser.on('data', function (chunk) {
      assert(Buffer.isBuffer(chunk))
      assert(Array.isArray(JSON.parse(chunk)))
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      done()
    })

    fstream.pipe(parser)
  })
})

describe('object mode', function () {
  it('should emit one array per line', function (done) {
    var parser = csv({ objectMode: true })
    var fstream = fs.createReadStream(fixture)

    var count = 0
    parser.on('data', function (chunk) {
      assert(Array.isArray(chunk))
      count += 1
    })

    parser.on('end', function () {
      assert.equal(count, 13)
      done()
    })

    fstream.pipe(parser)
  })

  it('should emit single column properly (issue #17)', function (done) {
    var parser = csv({ objectMode: true, columns: true })
    var count = 0

    str('COL0\ncol0\n').pipe(parser).on('data', function (chunk) {
      assert.deepEqual(chunk, { COL0: 'col0' })
      count += 1
    }).on('end', function () {
      assert.strictEqual(count, 1, 'should have emitted a single line')
      done()
    }).on('error', done)
  })

  it('should emit multiple columns properly', function (done) {
    var parser = csv({ objectMode: true, columns: true }, function (err, res) {
      if (err) return done(err)
      assert.strictEqual(res.length, 2, 'should have 2 rows')
      assert.deepEqual(res[0], { COL0: 'col0', COL1: 'col1' })
      assert.deepEqual(res[1], { COL0: 'col2', COL1: 'col3' })
      done()
    })

    str('COL0,COL1\ncol0,col1\ncol2,col3').pipe(parser)
  })
})

describe('edge cases', function () {
  it('should handle line breaks spanning multiple chunks', function (done) {
    var parser = csv({ newline: '\r\n' }, function (err, doc) {
      if (err) return done(err)
      assert.deepEqual(doc, [ [ 'hey', 'yo' ], ['foo', 'bar'] ])
      done()
    })
    parser.write('hey,yo\r')
    parser.end('\nfoo,bar')
  })

  it('should handle quotes spanning multiple chunks', function (done) {
    var parser = csv(function (err, doc) {
      if (err) return done(err)
      assert.deepEqual(doc, [ [ '"hey,yo"', 'foo', 'bar' ] ])
      done()
    })
    parser.write('"""hey,yo"')
    parser.end('"",foo,bar')
  })

  it('should handle all the quotes (issue #14)', function (done) {
    var input = 'name,description,watchers\n'
    input += 'SLaks/Styliner,"Turns CSS stylesheets into inline style="""" attributes for HTML emails",33\n'
    input += 'guelfey/go.dbus,Native Go bindings for D-Bus,33'

    str(input).pipe(csv({ columns: true }, function (err, res) {
      if (err) return done(err)

      assert.strictEqual(res.length, 2, 'should emit 2 lines')
      assert.strictEqual(res[0].name, 'SLaks/Styliner')
      assert.strictEqual(res[0].description, 'Turns CSS stylesheets into inline style="" attributes for HTML emails')
      assert.strictEqual(res[1].name, 'guelfey/go.dbus')
      assert.strictEqual(res[1].description, 'Native Go bindings for D-Bus')
      done()
    }))
  })
})

describe('column name transform', function () {
  it('should transform column names', function (done) {
    var input = 'Some Name,product_description,watchers\n'
    input += 'SLaks/Styliner,"Turns CSS stylesheets into inline style="""" attributes for HTML emails",33\n'
    input += 'guelfey/go.dbus,Native Go bindings for D-Bus,12'

    var opts = {
      columns: true,
      columnTransform: function (name) {
        switch (name) {
          case 'Some Name':
            return 'newName'
          case 'product_description':
            return 'productDescription'
          default:
            return name
        }
      }
    }

    str(input).pipe(csv(opts, function (err, res) {
      if (err) return done(err)

      assert.strictEqual(res.length, 2, 'should emit 2 lines')

      assert.strictEqual(res[0].hasOwnProperty('Some Name'), false)
      assert.strictEqual(res[0]['newName'], 'SLaks/Styliner')
      assert.strictEqual(res[0].hasOwnProperty('product_description'), false)
      assert.strictEqual(res[0]['productDescription'], 'Turns CSS stylesheets into inline style="" attributes for HTML emails')
      assert.strictEqual(res[0]['watchers'], '33')

      assert.strictEqual(res[1].hasOwnProperty('Some Name'), false)
      assert.strictEqual(res[1]['newName'], 'guelfey/go.dbus')
      assert.strictEqual(res[1].hasOwnProperty('product_description'), false)
      assert.strictEqual(res[1]['productDescription'], 'Native Go bindings for D-Bus')
      assert.strictEqual(res[1]['watchers'], '12')

      done()
    }))
  })
})
