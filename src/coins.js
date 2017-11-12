let {
  burnHandler,
  deepClone,
  stringify,
  sha256,
  base64ToBuffers
} = require('./common.js')

function coins (handlers) {
  // specify default fee handler if none given
  if (handlers.fee == null) {
    // TODO: use a better default fee handler
    handlers.fee = burnHandler
  }

  function getHandler (type, funcName) {
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

  function processInput (input, tx, state) {
    let onInput = getHandler(input.type, 'onInput')
    let subState = state[input.type]
    onInput(input, tx, subState)
  }

  function processOutput (output, tx, state) {
    let onOutput = getHandler(output.type, 'onOutput')
    let subState = state[output.type]
    onOutput(input, tx, subState)
  }

  // TODO: gernerate initial state obects at genesis

  // returns a lotion tx handler func
  return function coinsTxHandler (state, tx) {
    // buffer values are stored in the tx as base64 strings,
    // convert them back to buffers
    base64ToBuffers(tx)
    console.log(tx)

    let { inputs, outputs } = tx

    // ensure tx has inputs and outputs arrays
    putArrayCheck(inputs)
    putArrayCheck(outputs)

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
    tx.sigHash = getSigHash({ inputs, outputs })

    // process inputs and outputs
    for (let input of inputs) {
      processInput(input, tx, state)
    }
    for (let output of outputs) {
      processOutput(input, tx, state)
    }

    console.log('!')
  }
}

function putArrayCheck (puts) {
  if (puts == null) {
    throw Error('Must have both inputs and outputs arrays')
  }
  if (!Array.isArray(puts)) {
    throw Error('Inputs and outputs must be arrays')
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
    throw Error('Amounts must be >= 0')
  }
  if (!Number.isInteger(put.amount)) {
    throw Error('Amounts must be integers')
  }
  if (Number > Number.MAX_SAFE_INTEGER) {
    throw Error('Amounts must be < 2^53')
  }
}

function sumAmounts (puts) {
  let sum = puts.reduce((sum, { amount }) => sum + amount, 0)
  if (sum > Number.MAX_SAFE_INTEGER) {
    throw Error('Amount overflow')
  }
  return sum
}

function getSigHash (tx) {
  tx = deepClone(tx)

  // exclude properties of inputs named "signature" or "signatures"
  // (we can't check the signature against the hash of the signature!)
  let { inputs } = tx
  for (let input of inputs) {
    for (let key in input) {
      if (key === 'signature' || key === 'signatures') {
        delete input[key]
      }
    }
  }

  // stringify tx deterministically (and convert buffers to strings)
  // then return sha256 hash of that
  let txString = stringify(tx)
  return sha256(txString)
}

module.exports = coins
