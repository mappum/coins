#!/usr/bin/env node

let fs = require('fs')
let os = require('os')
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto')

let { wallet } = require('.')

// generates or loads wallet from default path (~/.coins)

let path = os.homedir() + '/.coins'
let privKey
if (!fs.existsSync(path)) {
  do {privKey = randomBytes(32)} while (!secp256k1.privateKeyVerify(privKey))
  fs.writeFileSync(path, privKey.toString('hex'))
} else {
  privkey = Buffer.from(fs.readFileSync(path), 'hex')
}
let address = wallet(privkey).address()

console.error('Your Address:')
console.log(address)
console.error(`
Your wallet seed is stored at "~/.coins",
make sure to keep it secret!`)
