/*jshint undef:false */
var assert = require('assert'),
    csv = require('../csv-streamify'),
    fs = require('fs')

var csvs = fs.readdirSync(__dirname + '/csv-spectrum/csvs'),
    names = csvs.map(function (file) { return file.replace(/.csv/, '')})

describe('csv-spectrum tests', function() {
  names.forEach(function (file, i) {
    var opts = { columns: true }
    // set encoding
    if (file == 'latin1') opts.inputEncoding = 'latin1'

    it(file, function (done) {
      var parser = csv(opts, cb)
      var s = fs.createReadStream(__dirname + '/csv-spectrum/csvs/' + file + '.csv')

      function cb (err, doc) {
        if (err) throw err

        try {
          assert.deepEqual(doc, require('./csv-spectrum/json/' + file))
        } catch(e) { return done(e) }
        done()
      }

      s.pipe(parser)
    })
  })

})
