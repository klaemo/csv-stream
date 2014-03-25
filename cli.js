#!/usr/bin/env node

var csv = require('./csv-streamify')

var arg = process.argv[2]
var opts = { encoding: 'utf8' }

if (!process.stdin.isTTY || arg === '-') {
  process.stdin.pipe(csv(opts)).pipe(process.stdout)
} else {
  var fs = require('fs')
  fs.createReadStream(arg).pipe(csv(opts)).pipe(process.stdout)
}
