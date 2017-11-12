let { post } = require('axios')
let secp = require('secp256k1')
let { buffersToBase64, sha256 } = require('./src/common.js')
let getSigHash = require('./src/sigHash.js')

let priv = sha256('lol')
let pub = secp.publicKeyCreate(priv)

let priv2 = sha256('wtf')
let pub2 = secp.publicKeyCreate(priv2)

async function main () {
  let tx = {
    from: {
      type: 'pubkey',
      amount: 5,
      pubkey: pub,
      sequence: 0
    },
    to: {
      type: 'pubkey',
      amount: 5,
      pubkey: pub2
    }
  }

  // sign tx
  let sigHash = getSigHash(tx)
  tx.from.signature = secp.sign(sigHash, priv).signature

  // convert buffers for serializing to JSON
  buffersToBase64(tx)
  let res = await post('http://localhost:8888/txs', tx)
  console.log(res.data)
}
main()
