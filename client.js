let { post } = require('axios')
let secp = require('secp256k1')
let { sha256, addressHash } = require('./src/common.js')
let getSigHash = require('./src/sigHash.js')

let priv = sha256('lol')
let pub = secp.publicKeyCreate(priv)
console.log(addressHash(pub))

let priv2 = sha256('wtf')
let pub2 = secp.publicKeyCreate(priv2)
let addr2 = addressHash(pub2)

async function main () {
  let tx = {
    from: {
      amount: 5,
      pubkey: pub,
      sequence: 0
    },
    to: {
      amount: 5,
      address: addr2
    }
  }

  // sign tx
  let sigHash = getSigHash(tx)
  tx.from.signature = secp.sign(sigHash, priv).signature

  let res = await post('http://localhost:8888/txs', tx)
  console.log(res.data)
}
main()
