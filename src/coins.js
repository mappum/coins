let { burnHandler, normalizeTx } = require('./common.js')
let getSigHash = require('./sigHash.js')
let pubkeyCoin = require('./pubkeyCoin.js')
let multisigCoin = require('./multisigCoin.js')

const defaultHandlers = {
  pubkey: pubkeyCoin,
  multisig: multisigCoin
}

function coins (handlers = {}) {
  // get handlers from `defaultHandlers`, and optionally add more or
  // override from `handlers`
  Object.assign({}, defaultHandlers, handlers)

  // specify default fee handler if none given
  if (handlers.fee == null) {
    // TODO: use a better default fee handler
    handlers.fee = burnHandler
  }

  // accesses a method from a handler
  function getHandlerMethod (type, funcName) {
    // get handler object
    let handler = handlers[type]
    if (handler == null) {
      throw Error(`Unknown handler type: "${type}"`)
    }

    // get method from handler object
    let func = handler[funcName]
    if (func == null) {
      throw Error(`Handler "${input.type}" does not implement "${funcName}"`)
    }
    return func
  }

  // runs an input
  function processInput (input, tx, state) {
    let onInput = getHandlerMethod(input.type, 'onInput')
    let subState = state[input.type]
    onInput(input, tx, subState)
  }

  // runs an output
  function processOutput (output, tx, state) {
    let onOutput = getHandlerMethod(output.type, 'onOutput')
    let subState = state[output.type]
    onOutput(output, tx, subState)
  }

  // TODO: generate initial substate objects at genesis

  // lotion tx handler func
  return function coinsTxHandler (state, tx) {
    // ensure tx has to and from
    if (tx.from == null || tx.to == null) {
      throw Error('Must have `to` and `from` values')
    }

    // convert tx to canonical format
    // (e.g. ensure `to` and `from` are arrays)
    normalizeTx(tx)
    let inputs = tx.from
    let outputs = tx.to

    // simple input/output checks (must have types and amounts)
    inputs.forEach(putCheck)
    outputs.forEach(putCheck)

    // make sure coin amounts in and out are equal
    let amountIn = sumAmounts(inputs)
    let amountOut = sumAmounts(outputs)
    if (amountIn !== amountOut) {
      throw Error('Sum of inputs and outputs must match')
    }

    // add properties to tx object
    // TODO: use a getter func (and cache the result)
    tx.sigHash = getSigHash({ from: inputs, to: outputs })

    // process inputs and outputs
    for (let input of inputs) {
      processInput(input, tx, state)
    }
    for (let output of outputs) {
      processOutput(output, tx, state)
    }

    return state
  }
}

// simple structure check for an input or an output
function putCheck (put) {
  if (typeof put.type !== 'string') {
    throw Error('Inputs and outputs must have a string `type`')
  }
  if (typeof put.amount !== 'number') {
    throw Error('Inputs and outputs must have a number `amount`')
  }
  if (put.amount < 0) {
    throw Error('Amount must be >= 0')
  }
  if (!Number.isInteger(put.amount)) {
    throw Error('Amount must be an integer')
  }
  if (put.amount > Number.MAX_SAFE_INTEGER) {
    throw Error('Amount must be < 2^53')
  }
}

function sumAmounts (puts) {
  let sum = puts.reduce((sum, { amount }) => sum + amount, 0)
  if (sum > Number.MAX_SAFE_INTEGER) {
    throw Error('Amount overflow')
  }
  return sum
}

module.exports = coins
