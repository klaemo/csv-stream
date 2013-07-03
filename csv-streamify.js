var Transform = require('stream').Transform,
    util = require('util'),
    Iconv

if (!Transform) {
  try {
    Transform = require('readable-stream').Transform
  } catch(err) {
    console.error('csv-streamify: Please "npm install readable-stream"', err)
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

  if (opts.encoding) {
    if (!Iconv) throw new Error('Please "npm install node-iconv"')
    this.iconv = new Iconv(opts.encoding, 'UTF-8');
    delete opts.encoding
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

    if (/*!this.isQuoted && */c === this.newline) {
      this.line.push(this.field)

      // emit the parsed line as an array if in object mode
      // or as a stringified array (default)
      if (this.objectMode) {
        this.push(this.line)
      } else {
        this.push(JSON.stringify(this.line))
      }

      if (this.cb) this.body.push(this.line)
      this.lineNo += 1

      // reset state
      this._reset()
      continue
    }

    // append current char to field string
    this.field += c
  }
}

CSVStream.prototype._reset = function () {
  this.field = ''
  this.line = []
  this.isQuoted = false
}

CSVStream.prototype.end = function (buf, encoding) {
  var self = this
  Transform.prototype.end.call(this, buf, encoding, function () {
    if (self.cb) self.cb(null, self.body)
  })
}
