#!/usr/bin/env node

let { wallet } = require('.')

// generates or loads wallet from default path (~/.coins)
let address = wallet().address()

console.error('Your Address:')
console.log(address)
console.error(`
Your wallet seed is stored at "~/.coins",
make sure to keep it secret!`)
