let secp256k1 = require('secp256k1')
let accounts = require('./accounts.js')
let { addressHash } = require('./common.js')

module.exports = accounts({
  deriveAddress ({ threshold, pubkeys }) {
    return addressHash(`${threshold}/${pubkeys.join()}`)
  },

  onSpend ({ threshold, pubkeys }, { signatures }, sigHash) {
    // verify and count valid signatures
    let validSigs = 0
    for (let i = 0; i < pubkeys.length) {
      let pubkey = pubkeys[i]
      let signature = signatures[i]

      // skip null sigs
      if (signature.length === 0) continue

      // verify signatures[i] against pubkeys[i]
      if (!secp256k1.verify(sigHash, signature, pubkey)) {
        throw Error('Invalid signature')
      }
      validSigs += 1

      // if enough sigs, the spend is valid
      if (validSigs === threshold) return
    }

    throw Error('Not enough signatures to meet threshold')
  }
})
