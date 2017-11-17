let { createHash } = require('crypto')
let stableStringify = require('json-stable-stringify')

function hashFunc (algo) {
  return (data) => createHash(algo).update(data).digest()
}

let sha256 = hashFunc('sha256')
let ripemd160 = hashFunc('ripemd160')

function addressHash (data) {
  let hash = ripemd160(sha256(data)).toString('base64')
  return hash.replace(/=/g, '') // remove the equals signs
}

let burnHandler = {
  // no-op, the coins just pay out to nowhere (economically,
  // this is the same as paying out to all coin holders)
  onOutput () {}
}

function normalizeTx (tx) {
  if (!Array.isArray(tx.from)) tx.from = [ tx.from ]
  if (!Array.isArray(tx.to)) tx.to = [ tx.to ]
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = {
  sha256,
  ripemd160,
  addressHash,
  burnHandler,
  normalizeTx,
  clone
}
