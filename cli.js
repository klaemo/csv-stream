#!/usr/bin/env node

const csv = require('./csv-streamify')

const arg = process.argv[2]
const opts = { encoding: 'utf8' }

if (!process.stdin.isTTY || arg === '-') {
  process.stdin.pipe(csv(opts)).pipe(process.stdout)
} else {
  require('fs').createReadStream(arg).pipe(csv(opts)).pipe(process.stdout)
}
