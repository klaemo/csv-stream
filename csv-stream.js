var Stream = require('stream')

module.exports = function csvStream(opts) {
  opts = opts || {}
  var delimiter = opts.delimiter || ',',
      newline = opts.newline || '\n',
      quote = opts.quote || '\"',
      empty = -1

  if (opts.hasOwnProperty('empty')) {
    empty = opts.empty
  }

  var s = new Stream()
  s.writable = true
  s.readable = true

  s.write = function (chunk) {
    if (Buffer.isBuffer(chunk)) chunk = chunk.toString()

    try {
      parse(chunk)
    } catch (err) {
      this.emit('error', err)
    }
    
    return true
  }

  s.end = function (buf) {
    if (arguments.length) s.write(buf)

    s.writable = false
    s.emit('end')
  }

  s.destroy = function () {
    s.writable = false
    s.emit('close')
  }

  // state
  var line = [], 
      field = '',
      isQuoted = false,
      lineNo = 0

  function parse (data) {
    var c
    for (var i = 0; i < data.length; i++) {
      c = data.charAt(i)
      
      if (c === quote && data.charAt(i + 1) !== quote) {
        isQuoted = isQuoted ? false : true
        continue
      }

      if (!isQuoted && c === delimiter) {
        if (field === '' && empty !== -1) field = empty
        line.push(field)
        field = ''
        continue
      }
      
      if (!isQuoted && c === '\n') {
        line.push(field)
        s.emit('data', line, lineNo)
        lineNo += 1
        field = ''
        line = []
        isQuoted = false
        continue
      }

      // append current char to field string
      field += c
    }
  }
  
  return s
}

