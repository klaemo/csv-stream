var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs'),
    path = require('path'),
    spectrum = require('csv-spectrum'),
    csvPath = path.join(process.cwd(), 'node_modules', 'csv-spectrum', 'csvs')

spectrum(function (err, data) {
  if (err) throw err
  
  describe('csv-spectrum tests', function() {
    data.forEach(function (spec) {
      it(spec.name, function (done) {
        var opts = { columns: true }
        // set encoding
        if (spec.name == 'latin1') opts.inputEncoding = 'latin1'

        if (/._crlf/.test(spec.name)) opts.newline = '\r\n'
        var parser = csv(opts, cb)
        var s = fs.createReadStream(path.join(csvPath, spec.name + '.csv'))

        function cb (err, doc) {
          if (err) return done(err)

          try {
            assert.deepEqual(doc, JSON.parse(spec.json))
          } catch(e) { return done(e) }
          done()
        }

        s.pipe(parser)
      })
    })

  })
})
