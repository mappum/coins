module.exports = require('./src/coins.js')
Object.assign(module.exports, {
  // handlers
  pubkeyCoin: require('./src/pubkeyCoin.js'),
  multisigCoin: require('./src/multisigCoin.js'),
  burnHandler: require('./src/common.js').burnHandler,

  // handler wrapper
  accounts: require('./src/accounts.js'),

  // helper functions
  getSigHash: require('./src/sigHash.js')
})
