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

try { Iconv = require('iconv').Iconv } catch (err) {}

module.exports = function (opts, cb) {
  var s = new CSVStream(opts, cb)
  if (typeof cb === 'function') s.on('error', cb)
  return s
}

module.exports.CSVStream = CSVStream

function CSVStream (opts, cb) {
  opts = opts || {}

  if (opts.inputEncoding) {
    if (!Iconv) throw new Error('Please "npm install iconv"')
    this.iconv = new Iconv(opts.inputEncoding, 'UTF-8')
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

  // state
  this.body = []
  this.isQuoted = false
  this.line = []
  this.field = ''
  this.lineNo = 0
}

util.inherits(CSVStream, Transform)

CSVStream.prototype._transform = function (chunk, encoding, done) {
  if (this.iconv) chunk = this.iconv.convert(chunk)
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

    if (!this.isQuoted && c === this.delimiter) {
      if (this.field === '') this.field = this.empty
      this.line.push(this.field)
      this.field = ''
      continue
    }

    if (c === this.newline) {
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

CSVStream.prototype.end = function (buf, encoding) {
  var self = this

  // flush last line
  if (self.line.length) self._line()

  Transform.prototype.end.call(this, buf, encoding, function () {
    if (self.cb) self.cb(null, self.body)
  })
}
