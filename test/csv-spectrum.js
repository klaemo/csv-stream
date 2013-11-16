var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs'),
    path = require('path'),
    spectrum = require('csv-spectrum'),
    csvPath = path.join(process.cwd(), 'node_modules', 'csv-spectrum', 'csvs'),
    async = require('async')

spectrum(function (err, data) {
  if (err) throw err
  
  describe('csv-spectrum tests', function() {
    async.each(data, function (spec, cb) {
      it(spec.name, function (done) {
        var opts = { columns: true }
        // set encoding
        if (spec.name == 'latin1') opts.inputEncoding = 'latin1'

        if (/._crlf/.test(spec.name)) opts.newline = '\r\n'
        var s = fs.createReadStream(path.join(csvPath, spec.name + '.csv'))

        var parser = csv(opts, function parsed (err, doc) {
          if (err) return done(err)
          console.log(spec.name)
          assert.deepEqual(doc, JSON.parse(spec.json))
          done()
          cb()
        })
        
        s.pipe(parser)
      })
    })

  })
})
