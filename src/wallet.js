let secp = require('secp256k1')
let coins = require('../index')
let { randomBytes } = require('crypto')

module.exports = function(priv, client) {
  if (!Buffer.isBuffer(priv) || priv.length !== 32) {
    throw Error('Private key must be a 32-byte buffer')
  }

  let creds = {}
  creds.priv = priv
  creds.pub = secp.publicKeyCreate(creds.priv)
  creds.address = coins.secp256k1Account.getAddress({ pubkey: creds.pub })

  return {
    address: creds.address,
    priv: creds.priv,
    pub: creds.pub,
    getBalance: async function() {
      let account = await client.state.accounts[creds.address]
      if (account) {
        return account.balance
      } else {
        return 0
      }
    },
    send: async function(address, amount) {
      let account = await client.state.accounts[creds.address]
      let tx = {
        from: {
          amount: amount,
          sequence: account ? account.sequence : 0,
          pubkey: creds.pub
        },
        to: { amount, address }
      }

      let sigHash = coins.getSigHash(tx)
      tx.from.signature = secp.sign(sigHash, creds.priv).signature
      return await client.send(tx)
    }
  }
}
