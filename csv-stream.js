var stream = require('stream'),
    util = require('util')

function CSVStream(opts, cb) {
  stream.Stream.call(this)
  this.writable = true
  this.readable = true

  // assign callback
  this.cb = null
  if (cb) this.cb = cb
  if (typeof opts === 'function') this.cb = opts
  
  opts = opts || {}
  this.delimiter = opts.delimiter || ','
  this.newline = opts.newline || '\n'
  this.quote = opts.quote || '\"'
  this.empty = -1

  // state
  this.body = []
  this.isQuoted = false
  this.line = []
  this.field = ''
  this.lineNo = 0

  this.on('error', function(err) {
    if (this.cb) this.cb(err)
  })
}

util.inherits(CSVStream, stream.Stream)

CSVStream.prototype.write = function (chunk) {
  if (Buffer.isBuffer(chunk)) chunk = chunk.toString()

  try {
    this.parse(chunk)
  } catch (err) {
    this.emit('error', err)
    if (this.cb) this.cb(err)
  }
  return true
}

CSVStream.prototype.parse = function (data) {
  var c
  for (var i = 0; i < data.length; i++) {
    c = data.charAt(i)
    
    if (c === this.quote && data.charAt(i + 1) !== this.quote) {
      this.isQuoted = this.isQuoted ? false : true
      continue
    }

    if (!this.isQuoted && c === this.delimiter) {
      if (this.field === '' && this.empty !== -1) this.field = this.empty
      this.line.push(this.field)
      this.field = ''
      continue
    }
    
    if (!this.isQuoted && c === '\n') {
      this.line.push(this.field)

      this.emit('data', this.line, this.lineNo)

      if (this.cb) this.body.push(this.line)
      this.lineNo += 1

      // reset state
      this.field = ''
      this.line = []
      this.isQuoted = false
      continue
    }

    // append current char to field string
    this.field += c
  }
}

CSVStream.prototype.end = function (buf) {
  if (arguments.length) this.write(buf)

  this.writable = false
  this.readable = false
  this.emit('end')
  if (this.cb) this.cb(null, this.body)
  this.emit('close')
}

CSVStream.prototype.destroy = function () {
  this.writable = false
  this.emit('close')
}

module.exports = function (opts, cb) {
  return new CSVStream(opts, cb)
}

module.exports.CSVStream = CSVStream
