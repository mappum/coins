# Coins

`coins` is a flexible, powerful framework for building cryptocurrencies on [Lotion](https://github.com/keppel/lotion) applications.

## Installation

Coins requires __node v7.6.0__ or higher.

```bash
$ npm install coins
```

## Usage

`chain.js`:
```js
let coins = require('coins')
let lotion = require('lotion')

let app = lotion({
  initialState: {}
})

app.use(coins({
  testcoin: {

    initialDistribution: {
      'judd': 10,
      'matt': 10
    },

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
      state[output.address] = (state[output.address] || 0) + output.amount
    }
  } 
}))


```

## License

MIT


