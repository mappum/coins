let { createHash } = require('crypto')
let stableStringify = require('json-stable-stringify')

function hashFunc (algo) {
  return (data) => createHash(algo).update(data).digest()
}

let sha256 = hashFunc('sha256')
let ripemd160 = hashFunc('ripemd160')

function addressHash (data) {
  return ripemd160(sha256(data)).toString('base64')
}

let burnHandler = {
  // no-op, the coins just pay out to nowhere (economically,
  // this is the same as paying out to all coin holders)
  onOutput () {}
}

function deepClone (obj, replacer) {
  let newObj = Array.isArray(obj) ? [] : {}
  Object.assign(newObj, obj)
  for (let key in newObj) {
    if (replacer) {
      newObj[key] = replacer(newObj[key])
    }
    if (typeof newObj[key] === 'object') {
      newObj[key] = deepClone(newObj[key], replacer)
    }
  }
  return newObj
}

const base64Prefix = ':base64:'

function bufferToBase64Replacer (value) {
  if (!Buffer.isBuffer(value)) return value
  return `${base64Prefix}${value.toString('base64')}`
}
function base64ToBufferReplacer (value) {
  if (typeof value !== 'string') return value
  if (!value.startsWith(base64Prefix)) return value
  return Buffer.from(value.slice(base64Prefix.length), 'base64')
}

// stringifies JSON deterministically, and converts Buffers to
// base64 strings (prefixed with ":base64:")
function stringify (obj) {
  obj = deepClone(obj, bufferToBase64Replacer)
  return stableStringify(obj)
}

function replace (obj, replacer) {
  for (let key in obj) {
    obj[key] = replacer(obj[key])
    if (typeof obj[key] === 'object' && !Buffer.isBuffer(obj[key])) {
      replace(obj[key], replacer)
    }
  }
}

function buffersToBase64 (obj) {
  replace(obj, bufferToBase64Replacer)
}

function base64ToBuffers (obj) {
  replace(obj, base64ToBufferReplacer)
}

module.exports = {
  sha256,
  ripemd160,
  addressHash,
  burnHandler,
  deepClone,
  stringify,
  buffersToBase64,
  base64ToBuffers
}
