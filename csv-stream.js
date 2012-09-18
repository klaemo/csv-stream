var Stream = require('stream')

module.exports = function csvStream(opts) {
  opts = opts || {}
  var delimiter = opts.delimiter || ',',
      newline = opts.newline || '\n',
      quote = opts.quote || '\"'

  var s = new Stream()
  s.writable = true
  s.readable = true

  s.write = function (buf) {
    parse(buf)
  }

  s.end = function (buf) {
    if (arguments.length) s.write(buf)

    s.writable = false
    s.emit('end')
  }

  s.destroy = function () {
    s.writable = false
  }

  var line = [], 
      field = '',
      isQuoted = false

  function parse (data) {
    data = data.toString()
    var c
    for (var i = 0; i < data.length; i++) {
      c = data.charAt(i)
      
      if (c === quote && data.charAt(i + 1) !== quote) {
        isQuoted = isQuoted ? false : true
        continue
      }

      if (!isQuoted && c === delimiter) {
        line.push(field)
        field = ''
        continue
      }
      
      if (!isQuoted && c === '\n') {
        line.push(field)
        s.emit('data', line)
        field = ''
        line = []
        isQuoted = false
        continue
      }

      field += c
    }
  }
  
  return s
}

