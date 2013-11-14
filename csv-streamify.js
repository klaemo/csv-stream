var Transform = require('stream').Transform,
    util = require('util'),
    Iconv

if (!Transform) {
  try {
    Transform = require('readable-stream').Transform
  } catch(err) {
    throw new Error('Please "npm install readable-stream"')
  }
}

try { iconv = require('iconv-lite') } catch (err) {}

module.exports = function (opts, cb) {
  var s = new CSVStream(opts, cb)

  if (s.cb) s.on('error', s.cb)
  return s
}

module.exports.CSVStream = CSVStream

function CSVStream (opts, cb) {
  opts = opts || {}

  if (opts.inputEncoding) {
    if (!iconv) throw new Error('Please "npm install iconv-lite"')
    if (!iconv.encodingExists(opts.inputEncoding))
      throw new Error('unkown input encoding')
    this.inputEncoding = opts.inputEncoding
  }

  Transform.call(this, opts)

  // assign callback
  this.cb = null
  if (cb) this.cb = cb
  if (typeof opts === 'function') this.cb = opts

  this.delimiter = opts.delimiter || ','
  this.newline = opts.newline || '\n'
  this.quote = opts.quote || '\"'
  this.empty = opts.hasOwnProperty('empty') ? opts.empty : ''
  this.objectMode = opts.objectMode || false
  this.hasColumns = opts.columns || false

  // state
  this.body = []
  this.isQuoted = false
  this.line = []
  this.field = ''
  this.lineNo = 0
  this.columns = []
}

util.inherits(CSVStream, Transform)

CSVStream.prototype._transform = function (chunk, encoding, done) {
  if (this.inputEncoding)
    chunk = iconv.fromEncoding(chunk, this.inputEncoding)
  
  chunk = chunk.toString()

  try {
    this._parse(chunk)
    done()
  } catch (err) {
    done(err)
  }
}

CSVStream.prototype._parse = function (data) {
  var c

  for (var i = 0; i < data.length; i++) {
    c = data.charAt(i)

    if (c === this.quote && data.charAt(i + 1) !== this.quote) {
      this.isQuoted = this.isQuoted ? false : true
      continue
    }

    // ""
    if (c === this.quote && data.charAt(i + 1) === this.quote) {
      this.isQuoted = this.isQuoted ? false : true
      this.field += c
      i += 1
      continue
    }

    if (!this.isQuoted && c === this.delimiter) {
      if (this.field === '') this.field = this.empty
      this.line.push(this.field)
      this.field = ''
      continue
    }

    // escape special chars in quotes
    if (this.isQuoted) {
      c = c.replace(/\r/, '\\r')
           .replace(/\n/, '\\n')
           .replace(/"/, '\"')
    }

    if (!this.isQuoted && c === this.newline) {
      this._line()
      continue
    } else if ((c + data.charAt(i + 1)) === this.newline) {
      this._line()
      // skip over \n of \r\n
      i += 1
      continue
    }

    // append current char to field string
    this.field += c
  }
}

CSVStream.prototype._line = function () {
  this.line.push(this.field)
  var line = {},
      self = this

  if (this.hasColumns) {
    if (this.lineNo === 0) {
      this.columns = this.line
      this.lineNo += 1
      this._reset()
      return
    }
    this.columns.forEach(function (column, i) {
      line[column] = self.line[i]
    })
    this.line = line
  }

  // emit the parsed line as an array if in object mode
  // or as a stringified array (default)
  if (this.objectMode) {
    this.push(this.line)
  } else {
    this.push(JSON.stringify(this.line) + '\n')
  }

  if (this.cb) this.body.push(this.line)
  this.lineNo += 1

  // reset state
  this._reset()
}

CSVStream.prototype._reset = function () {
  this.field = ''
  this.line = []
  this.isQuoted = false
}

CSVStream.prototype._flush = function (fn) {
  // flush last line
  try {
    if (this.line.length) this._line()
    if (this.cb) this.cb(null, this.body)
    fn()
  } catch(err) {
    fn(err)
  }
}
