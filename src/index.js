import merge from 'deepmerge'
export {default as middleware} from 'redux-thunk'

const {keys} = Object
const {isArray} = Array
const isObject = (obj) => obj === Object(obj) && !isArray(obj)

const chain = (...reducers) => (state, action) => (
  reducers.reduce((acc, reducer) => reducer(acc, action), state)
)

export const constants = {}
const handlers = {}
const storeInitialState = {
  pending: {},
  succeeded: {},
  failed: {}
}

const addConstant = (actionType) => {
  constants[actionType] = actionType
}

const addHandler = (actionType, handler) => {
  handlers[actionType] = handler
}

const mergeInitialState = (a, b) => {
  if (isObject(b) && isObject(a)) return merge(a, b)
  if (isArray(b) && isArray(a)) return [...a, ...b]
  return b
}

const extendInitialState = (state) => {
  keys(state).forEach((key) => {
    storeInitialState[key] = mergeInitialState(storeInitialState[key], state[key])
  })
}

const setHelper = (set) => (value) => (type) => (state) => ({
  ...state,
  [set]: {
    ...state[set],
    [type]: value
  }
})

const setSucceeded = setHelper('succeeded')(true)
const setFailed = setHelper('failed')(true)
const setIsPending = setHelper('pending')(true)
const setNotPending = setHelper('pending')(false)

const trimPayload = (payload) => payload.length === 1 ? payload[0] : payload

const SUCCESS = '_SUCCESS'
const FAILURE = '_FAILURE'

const createAsyncAction = (
  type,
  {
    condition,
    async,
    sideEffect,
    paired,
    handler,
    errorHandler,
    initialState
  }
) => {
  addHandler(type, setIsPending(type))
  addHandler(type + SUCCESS, chain(setNotPending(type), setSucceeded(type), handler))
  addHandler(type + FAILURE, chain(setNotPending(type), setFailed(type), errorHandler || handler))

  return (...payload) => (dispatch, getState) => {
    const state = getState()
    if (state.pending[type] || !condition(...payload, state, dispatch)) return

    dispatch({type})

    return async(...payload, state, dispatch).then(
      (...payload) => dispatch({type: type + SUCCESS, payload: trimPayload(payload)}),
      (error) => dispatch({type: type + FAILURE, error})
    ).then(() => {
      sideEffect(...payload, state)
      paired && dispatch(paired(...payload))
    })
  }
}

const noop = () => {}
const defaultHandler = state => state

export const createAction = (
  type,
  {
    condition = () => true,
    async,
    sideEffect = noop,
    paired,
    handler = defaultHandler,
    errorHandler = defaultHandler,
    initialState = {}
  } = {}
) => {
  addConstant(type)
  extendInitialState(initialState)

  if (async) return createAsyncAction(type, {condition, async, sideEffect, paired, handler, errorHandler, initialState})

  addHandler(type, handler)

  return (e, ...args) => (dispatch, getState) => {
    const state = getState()
    let payload

    if (e && e.hasOwnProperty('nativeEvent')) {
      payload = args
    } else {
      payload = [e, ...args]
    }

    if (!condition(...payload, state, dispatch)) return
    sideEffect(...payload, state)
    paired && dispatch(paired(...payload))
    return dispatch({type, payload: trimPayload(payload)})
  }
}

const reducer = (state = storeInitialState, {type, ...action} = {}) => (
  handlers.hasOwnProperty(type) ? handlers[type](state, action) : state
)

export default reducer
