var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs'),
    path = require('path'),
    spectrum = require('csv-spectrum'),
    csvPath = path.join(process.cwd(), 'node_modules', 'csv-spectrum', 'csvs')

spectrum(function (err, data) {
  if (err) throw err
  
  describe('csv-spectrum tests', function() {
    data.forEach(function (file, i) {
      var opts = { columns: true }
      // set encoding
      if (file.name == 'latin1') opts.inputEncoding = 'latin1'

      if (/._crlf/.test(file.name)) opts.newline = '\r\n'

      it(file.name, function (done) {
        var parser = csv(opts, cb)
        var s = fs.createReadStream(path.join(csvPath, file.name + '.csv'))

        function cb (err, doc) {
          if (err) return done(err)

          try {
            assert.deepEqual(doc, JSON.parse(file.json))
          } catch(e) { return done(e) }
          done()
        }

        s.pipe(parser)
      })
    })

  })
})
