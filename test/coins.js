let test = require('tape')
let coins = require('..')

function getHandler (module, type) {
  // TODO: update for object modules
  return module
    .find((h) => h.type === type)
    .middleware
}

test('initializer', (t) => {
  t.test('no options', (t) => {
    let c = coins()
    let initializer = getHandler(c, 'initializer')

    let state = {}
    initializer(state, {})

    t.deepEquals(state.accounts, {})
    t.deepEquals(state.fee, {})

    t.end()
  })

  t.test('with initialBalances', (t) => {
    let c = coins({
      initialBalances: {
        'foo': 123
      }
    })
    let initializer = getHandler(c, 'initializer')

    let state = {}
    initializer(state, {})

    t.deepEquals(state.accounts, { foo: { sequence: 0, balance: 123 } })
    t.deepEquals(state.fee, {})

    t.end()
  })

  t.test('with handler that has initialState', (t) => {
    let c = coins({
      handlers: {
        foo: {
          initialState: { bar: 'baz' }
        }
      }
    })
    let initializer = getHandler(c, 'initializer')

    let state = {}
    initializer(state, {})

    t.deepEquals(state.foo, { bar: 'baz' })
    t.deepEquals(state.accounts, {})
    t.deepEquals(state.fee, {})

    t.end()
  })

  t.test('with handler that has initializer', (t) => {
    let state = {}
    let context = {}
    let opts = {
      handlers: {
        foo: {
          initialize: (state2, context2, opts2) => {
            t.equals(state2, state.foo)
            t.equals(context2, context)
            t.equals(opts2, opts)
            state2.bar = 'baz'
          }
        }
      }
    }
    let c = coins(opts)
    let initializer = getHandler(c, 'initializer')

    initializer(state, context)

    t.deepEquals(state.foo, { bar: 'baz' })
    t.deepEquals(state.accounts, {})
    t.deepEquals(state.fee, {})

    t.end()
  })

  t.end()
})
