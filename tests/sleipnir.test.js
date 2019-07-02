import configureMockStore from 'redux-mock-store'
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import reducer, {createAction, createSelector, setState, constants} from '../'

const mockStore = configureMockStore([thunk])

describe('Sleipnir', () => {
  describe('helpers', () => {
    it('sets state immutably', () => {
      const state = {test: {testing: [{another: 456}, {thing: 123}]}}
      const newState = setState(state, 'test', 'testing', 1, 'thing', x => x * 2)
      const moreState = setState(newState, 'what', 'about', 'over', 'here', 987)
      expect(state).not.toBe(newState)
      expect(newState).not.toBe(moreState)
      expect(newState.test.testing[1].thing).toBe(246)
      expect(moreState.test.testing[1].thing).toBe(246)
      expect(moreState.what.about.over.here).toBe(987)
    })

    it('creates lenses into state', () => {
      const state = {test: {testing: [{another: 456}, {thing: 123}]}}
      const getThing = createSelector('test', 'testing', 1, 'thing')
      expect(getThing(state)).toBe(123)
    })
  })
  describe('createAction', () => {
    it('sets constants for external reference', () => {
      createAction('CONSTANT_TEST')
      expect(constants.CONSTANT_TEST).toBe('CONSTANT_TEST')
    })

    it('creates a synchronous action', () => {
      const action = createAction('TEST_ACTION')
      const store = mockStore()
      store.dispatch(action('test_payload'))
      expect(store.getActions()).toEqual([{type: constants.TEST_ACTION, payload: 'test_payload'}])
    })

    it('creates as asynchronous action', async () => {
      const action = createAction('TEST_ASYNC_ACTION', {
        initialState: {number: 0},
        async: n => Promise.resolve(n * 2),
        handler: (state, n) => setState(state, 'number', n)
      })
      const store = createStore(reducer, {}, applyMiddleware(thunk))
      await store.dispatch(action(123))
      const expectedState = {
        failed: {},
        pending: {TEST_ASYNC_ACTION: false},
        succeeded: {TEST_ASYNC_ACTION: true},
        number: 246,
      }
      expect(store.getState()).toEqual(expectedState)
    })
  })

  describe('reducer', () => {
    it('returns pending, succeeded, and failed initial state', () => {
      expect(reducer()).toEqual({
        pending: {},
        succeeded: {},
        failed: {},
        number:0,
      })
      const action = createAction('TEST_ACTION', {initialState: {tests: []}})
      expect(reducer()).toEqual({
        pending: {},
        succeeded: {},
        failed: {},
        number:0,
        tests: []
      })
    })
  })
})
