function accounts ({ onSpend, getAddress }) {
  if (typeof onSpend !== 'function') {
    throw Error('Must specify an onSpend function')
  }
  if (typeof getAddress !== 'function') {
    throw Error('Must specify a getAddress function')
  }

  return {
    // on spend, debit from sender's account
    onInput (input, tx, state) {
      let { amount, sequence } = input

      // account must exist
      let address = getAddress(input)
      if (state[address] == null) {
        throw Error(`Non-existent account "${address}"`)
      }

      // verify account balance/sequence
      let account = state[address]
      if (account.balance < amount) {
        throw Error('Insufficient funds')
      }
      if (sequence !== account.sequence) {
        throw Error('Sequence number mismatch')
      }

      // should throw if input is not allowed to spend
      onSpend(input, tx)

      // debit account
      account.balance -= amount
      account.sequence += 1
    },

    // for each output of this type, add to account
    onOutput ({ address, amount }, tx, state) {
      // initialize empty accounts
      if (state[address] == null) {
        state[address] = { balance: 0, sequence: 0 }
      }

      // add to account
      state[address].balance += amount
    }
  }
}

module.exports = accounts
