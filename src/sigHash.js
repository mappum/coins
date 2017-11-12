let { deepClone, stringify, sha256 } = require('./common.js')

// gets the hash of a transaction to be used for signing
module.exports = function getSigHash (tx) {
  tx = deepClone(tx)

  // normalize tx
  if (!Array.isArray(tx.from)) tx.from = [ tx.from ]
  if (!Array.isArray(tx.to)) tx.to = [ tx.to ]

  // exclude properties of inputs named "signature" or "signatures"
  // (we can't check the signature against the hash of the signature!)
  for (let input of tx.from) {
    for (let key in input) {
      if (key === 'signature' || key === 'signatures') {
        delete input[key]
      }
    }
  }

  // stringify tx deterministically (and convert buffers to strings)
  // then return sha256 hash of that
  let txString = stringify(tx)
  return sha256(txString)
}
