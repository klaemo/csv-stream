/* global describe, it */

var assert = require('assert')
var csv = require('../csv-streamify')
var fs = require('fs')
var path = require('path')
var base = path.join(process.cwd(), 'node_modules', 'csv-spectrum')
var csvPath = path.join(base, 'csvs')

describe('spectrum', function () {
  const specs = fs.readdirSync(csvPath).map(function (spec) { return spec.replace('.csv', '') })

  specs.forEach(function (spec) {
    it(spec, function (done) {
      var opts = { columns: true }

      if (/._crlf/.test(spec)) opts.newline = '\r\n'
      var s = fs.createReadStream(path.join(csvPath, spec + '.csv'))

      var parser = csv(opts, function parsed (err, doc) {
        if (err) return done(err)
        assert.deepEqual(doc, require('csv-spectrum/json/' + spec))
        done()
      })

      s.pipe(parser)
    })
  })
})
