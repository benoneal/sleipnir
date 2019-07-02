export const setState = (state = {}, ...set) => {
  if (set.length === 0) return state
  const key = set.shift()
  if (typeof key === 'function') return setState(key(state), ...set)
  if (set.length === 0) return key
  if (typeof key === 'number' && Array.isArray(state)) {
    state = [...state]
    state[key] = setState(state[key], ...set)
    return state
  }
  return {...state, [key]: setState(state[key], ...set)}
}

const getState = (state, ...path) => {
  if (path.length === 0) return state
  const key = path.shift()
  if (typeof key === 'function') return getState(key(state), ...path)
  if (path.length === 0) return state[key]
  return getState(state[key], ...path)
}

export const createSelector = (...path) => state => getState(state, ...path)

const chain = (...reducers) => (state, action) =>
  reducers.reduce((acc, reducer) => reducer(acc, action), state)

export const constants = {}
const handlers = {}
const initialStateBuffer = [{
  pending: {},
  succeeded: {},
  failed: {}
}]

const addConstant = type => constants[type] = type
const addInitialState = state => initialStateBuffer.push(state)
const addHandler = (type, handler) => handlers[type] = handler

const setSucceeded = type => state => setState(state, 'succeeded', type, true)
const setFailed = type => state => setState(state, 'failed', type, true)
const setIsPending = type => state => setState(state, 'pending', type, true)
const setNotPending = type => state => setState(state, 'pending', type, false)

const trimPayload = payload => payload.length === 1 ? payload[0] : payload

const SUCCESS = '_SUCCESS'
const FAILURE = '_FAILURE'

const createAsyncAction = (
  type,
  {
    async,
    handler,
    errorHandler
  }
) => {
  addHandler(type, setIsPending(type))
  addHandler(type + SUCCESS, chain(setNotPending(type), setSucceeded(type), handler))
  addHandler(type + FAILURE, chain(setNotPending(type), setFailed(type), errorHandler || handler))

  return (...payload) => (dispatch, getState) => {
    const state = getState()
    if (state.pending[type]) return

    dispatch({type})

    return async(trimPayload(payload), state, dispatch).then(
      payload => dispatch({type: type + SUCCESS, payload}),
      error => dispatch({type: type + FAILURE, error})
    )
  }
}

const defaultHandler = state => state

export const createAction = (
  type,
  {
    async,
    handler = defaultHandler,
    errorHandler = defaultHandler,
    initialState = {}
  } = {}
) => {
  addConstant(type)
  addInitialState(initialState)
  if (async) return createAsyncAction(type, {async, handler, errorHandler})
  addHandler(type, handler)

  return (e, ...args) => {
    const payload = trimPayload((e && e.hasOwnProperty('nativeEvent')) ? args : [e, ...args])
    return {type, payload}
  }
}

const initialState = _ => initialStateBuffer.reduce((acc, state) => ({...acc, ...state}), {})

const reducer = (state = initialState(), {type, payload, error} = {}) => {
  if (!state.pending || !state.succeeded || !state.failed) state = {...state, ...initialState()}
  return handlers.hasOwnProperty(type) ? handlers[type](state, payload, error) : state
}

export default reducer
