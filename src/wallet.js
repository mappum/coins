let { randomBytes } = require('crypto')
let fs = require('fs')
let { join } = require('path')
let mkdirp = require('mkdirp').sync
let secp = require('secp256k1')
let home = require('user-home')
let coins = require('..')

// TODO: HD scheme for deriving per-GCI keys
// TODO: key encryption
// TODO: support user-provided seed

class Wallet {
  constructor (privkey, client) {
    if (!Buffer.isBuffer(privkey) || privkey.length !== 32) {
      throw Error('"privkey" must be a 32-byte Buffer')
    }

    this.client = client
    this.privkey = privkey
    this.pubkey = secp.publicKeyCreate(this.privkey)
    this._address = getAddress(this.pubkey)
  }

  address () {
    return this._address
  }

  async balance () {
    this.assertClient()
    let accounts = this.client.state.accounts
    let account = await accounts[this._address]
    if (account == null) {
      return 0
    }
    return account.balance
  }

  async send (toAddress, amount) {
    this.assertClient()
    if (typeof toAddress !== 'string') {
      throw Error('"toAddress" must be a string')
    }
    if (!Number.isInteger(amount)) {
      throw Error('"amount" must be an integer')
    }

    // get our account sequence number
    let accounts = this.client.state.accounts
    let account = await accounts[this._address]

    // build tx
    let tx = {
      from: {
        amount,
        sequence: account ? account.sequence : 0,
        pubkey: this.pubkey
      },
      to: {
        amount,
        address: toAddress
      }
    }

    // sign tx
    let sigHash = coins.getSigHash(tx)
    tx.from.signature = secp.sign(sigHash, this.privkey).signature

    // broadcast tx
    return this.client.send(tx)
  }

  assertClient () {
    if (this.client == null) {
      throw Error('Not connected with a Lotion light client')
    }
  }
}

function getAddress (pubkey) {
  return coins.secp256k1Account.getAddress({ pubkey })
}

function defaultPath () {
  return join(home, '.coins')
}

function createOrLoadSeed (path) {
  let seedPath = join(path, 'secret')

  let exists
  try {
    fs.accessSync(seedPath)
    exists = true
  } catch (err) {
    exists = false
  }

  // load existing seed
  if (exists) {
    return Buffer.from(fs.readFileSync(seedPath), 'hex')
  }

  // generate random seed
  let seed = randomBytes(32)
  mkdirp(path)
  fs.writeFileSync(seedPath, seed, 'hex')
  return seed
}

function createOrLoadWallet (path = defaultPath(), client) {
  if (typeof path === 'object') {
    client = path
    path = defaultPath()
  }

  let privkey = createOrLoadSeed(path)
  return new Wallet(privkey, client)
}

module.exports = createOrLoadWallet
