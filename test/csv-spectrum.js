/* global describe, it */
'use strict'

const assert = require('assert')
const csv = require('../csv-streamify')
const fs = require('fs')
const path = require('path')
const base = path.join(process.cwd(), 'node_modules', 'csv-spectrum')
const csvPath = path.join(base, 'csvs')

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
