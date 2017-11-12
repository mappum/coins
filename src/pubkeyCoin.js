let secp256k1 = require('secp256k1')
let accounts = require('./accounts.js')
let { addressHash } = require('./common.js')

module.exports = accounts({
  // address is hash of pubkey
  getAddress (inputOrOutput) {
    return addressHash(inputOrOutput.pubkey)
  },

  // specify rule for taking money out of account
  // (must have a valid signature from this account's pubkey)
  onSpend ({ pubkey, signature }, { sigHash, consumeGas }) {
    // verify signature
    if (!secp256k1.verify(sigHash, signature, pubkey)) {
      throw Error('Invalid signature')
    }
  }
})
