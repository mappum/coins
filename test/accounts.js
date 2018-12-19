let test = require('tape')
let accounts = require('../src/accounts.js')

test('account handlers', (t) => {
  t.test('with no handlers', (t) => {
    try {
      accounts()
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Must specify one or more account handlers')
    }
    t.end()
  })

  t.test('handler with missing onSpend', (t) => {
    try {
      accounts({})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Must specify one or more account handlers')
    }
    t.end()
  })

  t.test('empty handler object', (t) => {
    try {
      accounts({})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Must specify one or more account handlers')
    }
    t.end()
  })

  t.test('invalid handler object', (t) => {
    try {
      accounts({ onSpend () {} })
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Account handler must specify an onSpend function')
    }
    t.end()
  })

  t.test('invalid handler object', (t) => {
    try {
      accounts({ getAddress () {} })
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Account handler must specify an onSpend function')
    }
    t.end()
  })

  t.test('valid handler object', (t) => {
    accounts({
      getAddress () {},
      onSpend () {}
    })
    t.pass()
    t.end()
  })

  t.test('valid multi-handler object', (t) => {
    accounts({
      foo: {
        getAddress () {},
        onSpend () {}
      },
      bar: {
        getAddress () {},
        onSpend () {}
      }
    })
    t.pass()
    t.end()
  })

  t.end()
})

test('input handler', (t) => {
  t.test('missing accountType', (t) => {
    let module = accounts({
      foo: {
        getAddress (input) {
          return input.address
        },
        onSpend (input, context) {}
      }
    })

    try {
      module.onInput({
        sequence: 0,
        amount: 1
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Account type must be a string')
    }

    t.end()
  })

  t.test('unknown accountType', (t) => {
    let module = accounts({
      foo: {
        getAddress (input) {
          return input.address
        },
        onSpend (input, context) {}
      }
    })

    try {
      module.onInput({
        sequence: 0,
        amount: 1,
        accountType: 'bar'
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Unknown account handler "bar"')
    }

    t.end()
  })

  t.test('invalid sequence', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {}
    })

    try {
      module.onInput({
        sequence: '1',
        amount: 1
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Sequence number must be an integer')
    }

    t.end()
  })

  t.test('spending from non-existent account', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {}
    })

    try {
      module.onInput({
        sequence: 1,
        amount: 1,
        address: 'foo'
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Non-existent account "foo"')
    }

    t.end()
  })

  t.test('incorrect sequence number', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {}
    })

    try {
      module.onInput({
        sequence: 1,
        amount: 1,
        address: 'foo'
      }, {
        foo: { balance: 1, sequence: 0 }
      }, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Sequence number mismatch')
    }

    t.end()
  })

  t.test('insufficient funds', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {}
    })

    try {
      module.onInput({
        sequence: 0,
        amount: 2,
        address: 'foo'
      }, {
        foo: { balance: 1, sequence: 0 }
      }, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Insufficient funds')
    }

    t.end()
  })

  t.test('onSpend throws', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {
        throw Error('error')
      }
    })

    try {
      module.onInput({
        sequence: 0,
        amount: 1,
        address: 'foo'
      }, {
        foo: { balance: 1, sequence: 0 }
      }, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'error')
    }

    t.end()
  })

  t.test('valid spend', (t) => {
    let module = accounts({
      getAddress (input) {
        return input.address
      },
      onSpend (input, context) {}
    })

    let state = {
      foo: { balance: 2, sequence: 0 }
    }
    module.onInput({
      sequence: 0,
      amount: 1,
      address: 'foo'
    }, state, {})

    t.deepEquals(state, {
      foo: {
        balance: 1,
        sequence: 1
      }
    })

    t.end()
  })

  t.test('valid spend with multiple handlers', (t) => {
    let module = accounts({
      foo: {
        getAddress (input) {
          return input.address
        },
        onSpend (input, context) {
          throw Error('wrong handler')
        }
      },
      bar: {
        getAddress (input) {
          return input.address
        },
        onSpend (input, context) {}
      }
    })

    let state = {
      foo: { balance: 2, sequence: 0 }
    }
    module.onInput({
      sequence: 0,
      amount: 1,
      address: 'foo',
      accountType: 'bar'
    }, state, {})

    t.deepEquals(state, {
      foo: {
        balance: 1,
        sequence: 1
      }
    })

    t.end()
  })

  t.end()
})

test('output handler', (t) => {
  t.test('invalid address', (t) => {
    let module = accounts({
      getAddress (input) {},
      onSpend (input, context) {}
    })

    try {
      module.onOutput({
        amount: 1,
        address: 123
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Address is required')
    }

    t.end()
  })

  t.test('balance overflow', (t) => {
    let module = accounts({
      getAddress (input) {},
      onSpend (input, context) {}
    })

    let state = {
      foo: {
        balance: 2 ** 52,
        sequence: 0
      }
    }
    try {
      module.onOutput({
        amount: 2 ** 52,
        address: 'foo'
      }, state, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Error adding to account balance')
    }

    t.end()
  })

  t.test('invalid amount', (t) => {
    let module = accounts({
      getAddress (input) {},
      onSpend (input, context) {}
    })

    try {
      module.onOutput({
        amount: '123',
        address: 'foo'
      }, {}, {})
      t.fail()
    } catch (err) {
      t.equals(err.message, 'Invalid amount')
    }

    t.end()
  })

  t.test('new account', (t) => {
    let module = accounts({
      getAddress (input) {},
      onSpend (input, context) {}
    })

    let state = {}

    module.onOutput({
      amount: 1,
      address: 'foo'
    }, state, {})

    t.deepEquals(state, {
      foo: {
        balance: 1,
        sequence: 0
      }
    })

    t.end()
  })

  t.test('existing account', (t) => {
    let module = accounts({
      getAddress (input) {},
      onSpend (input, context) {}
    })

    let state = {
      foo: { balance: 1, sequence: 0 }
    }

    module.onOutput({
      amount: 1,
      address: 'foo'
    }, state, {})

    t.deepEquals(state, {
      foo: {
        balance: 2,
        sequence: 0
      }
    })

    t.end()
  })

  t.end()
})
