var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs'),
    path = require('path'),
    fs = require('fs'),
    base = path.join(process.cwd(), 'node_modules', 'csv-spectrum'),
    csvPath = path.join(base, 'csvs'),
    async = require('async')

describe('spectrum', function() {
  var specs = fs.readdirSync(csvPath)
    .map(function (spec) { return spec.replace('.csv', '') })
    
  specs.forEach(function (spec) {
    it(spec, function (done) {
      var opts = { columns: true }
      // set encoding
      if (spec == 'latin1') opts.inputEncoding = 'latin1'

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

