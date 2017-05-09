import {describe, it} from 'mocha'
import assert from 'assert'
import configureMockStore from 'redux-mock-store'

import reducer, {createAction, constants, middleware} from '../src'

const mockStore = configureMockStore([middleware])

const same = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

describe('Sleipnir', () => {
  describe('createAction', () => {
    it('sets constants for external reference', () => {
      createAction('CONSTANT_TEST')
      assert(constants.CONSTANT_TEST === 'CONSTANT_TEST')
    })

    it('creates a synchronous action', () => {
      const action = createAction('TEST_ACTION')
      const store = mockStore()
      action('test_payload')(store.dispatch, () => ({}))
      assert(same(store.getActions(), [{type: constants.TEST_ACTION, payload: 'test_payload'}]))
    })
  })

  describe('reducer', () => {
    it('returns pending, succeeded, and failed initial state', () => {
      assert(same(reducer(), {
        pending: {},
        succeeded: {},
        failed: {}
      }))
    })
  })
})
