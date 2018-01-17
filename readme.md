# Coins

`coins` is a flexible, powerful framework for building cryptocurrencies on top of [Lotion](https://github.com/keppel/lotion).

## Installation

`coins` requires __node v7.6.0__ or higher.

```bash
$ npm install coins
```

## Usage

### Basic coin usage
Adding a cryptocurrency to a lotion app just takes a few lines of code.
`app.js`
```js
let lotion = require('lotion')
let coins = require('coins')

let app = lotion({ initialState: {} })

app.use(coins({
  name: 'kittycoin',
  initialBalances: {
    // map addresses to balances
    '04oDVBPIYP8h5V1eC1PSc/JU6Vo': 10,
    'OGccsuLV2xuoDau1XRc6hc7uO24': 20
  }
}))

app.listen(3000)
```

then build a wallet
`wallet.js`:
```js
let lotion = require('lotion')
let coins = require('coins')
let client = await lotion.connect(APP_GCI)

let wallet = coins.wallet(client)

// wallet methods:
let address = wallet.getAddress()
console.log(address) // 'OGccsuLV2xuoDau1XRc6hc7uO24'

let balance = await wallet.getBalance()
console.log(balance) // 20

let result = await wallet.send('04oDVBPIYP8h5V1eC1PSc/JU6Vo', 5)
console.log(result) // { height: 42 }
```


### Writing your own advanced coin

`chain.js`:
```js
let coins = require('coins')
let lotion = require('lotion')

let app = lotion({
  initialState: {}
})

app.use(coins({
    name: 'testcoin',
    initialState: {
      'judd': 10,
      'matt': 10
    },

    modules: {
      'my-module': {
        onInput(input, state) {
          // this function is called when coins of
          // this type are used as a transaction input.

          // if the provided input isn't valid, throw an error.
          if(isNotValid(input)) {
            throw Error('this input isn\'t valid!')
          }

          // if the input is valid, update the state to
          // reflect the coins having been spent.
          state[input.senderAddress] -= input.amount
        },

        onOutput(output, state) {
          // here's where you handle coins of this type
          // being received as a tx output.

          // usually you'll just want to mutate the state
          // to increment the balance of some address.
          state[output.receiverAddress] = (state[output.receiverAddress] || 0) + output.amount
        }
      }
    }
  }
}))

app.listen(3000)
```

run `node chain.js`, then write
`client.js`:
```js
let lotion = require('lotion')
let client = await lotion.connect(YOUR_APP_GCI)

let result = await client.send({
  from: [
    // tx inputs. each must include an amount:
    { amount: 4, type: 'my-module', senderAddress: 'judd' }
  ],
  to: [
    // tx outputs. sum of amounts must equal sum of amounts of inputs.
    { amount: 4, type: 'my-module', receiverAddress: 'matt' }
  ]
})

console.log(result)
// { ok: true, height: 42 }

```
## License

MIT
