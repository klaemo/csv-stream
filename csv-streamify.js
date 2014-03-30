var Transform = require('stream').Transform,
    util = require('util'),
    iconv

if (!Transform) {
  try {
    Transform = require('readable-stream').Transform
  } catch(err) {
    throw new Error('Please "npm install readable-stream".')
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
    if (!iconv) throw new Error('Please "npm install iconv-lite".')
    if (!iconv.encodingExists(opts.inputEncoding))
      throw new Error('Unknown input encoding "' + opts.inputEncoding + '".')
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
  this.lineNo = 0
  this._isQuoted = false
  this._prev = []
  this._newlineDetected = false
  this._line = []
  this._field = ''
  this._columns = []
}

util.inherits(CSVStream, Transform)

CSVStream.prototype._transform = function (chunk, encoding, done) {
  if (this.inputEncoding)
    chunk = iconv.fromEncoding(chunk, this.inputEncoding)
  
  chunk = chunk.toString()

  try {
    this.parse(chunk)
    done()
  } catch (err) {
    done(err)
  }
}

CSVStream.prototype._quoted = function (d, i) {
  this._prevChar = d.charAt(i)
  var single = d.charAt(i + 1) !== this.quote,
      dbl = d.charAt(i + 1) === this.quote && d.charAt(i + 2) === this.quote

  return single || dbl
}

// keep the last 3 chars around
CSVStream.prototype._q = function (char) {
  this._prev.unshift(char) 
  while (this._prev.length > 3) this._prev.pop()
}

CSVStream.prototype.parse = function (data) {
  var c
  
  for (var i = 0; i < data.length; i++) {
    c = data.charAt(i)

    // we have a line break
    if (!this._isQuoted && this._newlineDetected) {
      this._newlineDetected = false
      this._emitLine()
      // crlf
      if (c === this.newline[1]) {
        this._q(c)
        continue
      }
    }

    // skip over quote
    if (c === this.quote) {
      this._q(c)
      continue
    }

    // once we hit a regular char, check if quoting applies

    // xx"[c]
    if (c !== this.quote && this._prev[0] === this.quote && 
        this._prev[1] !== this.quote) {
      this._isQuoted = this._isQuoted ? false : true
    }

    // """[c]
    if (c !== this.quote && this._prev[0] === this.quote && 
        this._prev[1] === this.quote && this._prev[2] === this.quote) {
      this._isQuoted = this._isQuoted ? false : true
      this._field += this.quote
    }

    // x""[c]
    if (this._field && c !== this.quote && 
        this._prev[0] === this.quote && 
        this._prev[1] === this.quote && 
        this._prev[2] !== this.quote) {
      this._field += this.quote
    }

    // delimiter
    if (!this._isQuoted && c === this.delimiter) {
      if (this._field === '') this._field = this.empty
      this._line.push(this._field)
      this._field = ''
      this._q(c)
      continue
    }

    // newline
    if (!this._isQuoted && (c === this.newline || c === this.newline[0])) {
      this._newlineDetected = true
      this._q(c)
      continue
    }

    this._q(c)
    // append current char to _field string
    this._field += c
  }
}

CSVStream.prototype._emitLine = function () {
  this._line.push(this._field)
  var line = {},
      self = this

  if (this.hasColumns) {
    if (this.lineNo === 0) {
      this._columns = this._line
      this.lineNo += 1
      this._reset()
      return
    }
    this._columns.forEach(function (column, i) {
      line[column] = self._line[i]
    })
    this._line = line
  }

  // emit the parsed line as an array if in object mode
  // or as a stringified array (default)
  if (this.objectMode) {
    this.push(this._line)
  } else {
    this.push(JSON.stringify(this._line) + '\n')
  }

  if (this.cb) this.body.push(this._line)
  this.lineNo += 1

  // reset state
  this._reset()
}

CSVStream.prototype._reset = function () {
  this._prev = []
  this._field = ''
  this._line = []
  this._isQuoted = false
}

CSVStream.prototype._flush = function (fn) {
  // flush last line
  try {
    if (this._line.length) this._emitLine()
    if (this.cb) this.cb(null, this.body)
    fn()
  } catch(err) {
    fn(err)
  }
}
