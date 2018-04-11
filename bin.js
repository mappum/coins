#!/usr/bin/env node

let fs = require('fs')
let os = require('os')
const { randomBytes } = require('crypto')

let { wallet } = require('.')

// generates or loads wallet from default path (~/.coins)

let path = os.homedir() + '/.coins'
!fs.existsSync(path) && fs.writeFileSync(path, randomBytes(32))
let privkey = fs.readFileSync(path)

let address = wallet(privkey).address()

console.error('Your Address:')
console.log(address)
console.error(`
Your wallet seed is stored at "~/.coins",
make sure to keep it secret!`)
