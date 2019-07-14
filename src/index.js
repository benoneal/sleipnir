const isBrowser = (
  typeof module === 'undefined' &&
  self && !self.module &&
  typeof window !== 'undefined'
  && typeof document !== 'undefined'
  && document.nodeType === 9
)

const isNumber = n => typeof n === 'number' || (!isNaN(Number(n)) && !isNaN(parseInt(n)))

export const setState = (state = {}, ...set) => {
  if (set.length === 0) return state
  const key = set.shift()
  if (typeof key === 'function') return setState(key(state), ...set)
  if (set.length === 0) return key
  state = isNumber(key) ? Array.from(state || []) : {...(state || {})}
  state[key] = setState(state[key], ...set)
  return state
}

export const simpleHandler = (...path) => (state, value) => setState(state, ...path, value)

const getState = (state, current, ...path) => {
  if (path.length === 0) return current
  const key = path.shift()
  if (typeof key === 'function') return getState(state, key(current, state), ...path)
  if (path.length === 0) return current[key]
  return getState(state, current[key], ...path)
}

export const createSelector = (key, ...path) => state =>
  getState(
    state,
    typeof key === 'function' ? key(state, state) : state[key],
    ...path
  )

const chain = (...reducers) => (state, action) =>
  reducers.reduce((acc, reducer) => reducer(acc, action), state)

export const constants = {}
const handlers = {}
const namedAsync = {}
const initialStateBuffer = [{
  pending: {},
  succeeded: {},
  failed: {},
  ssr_cached: {}
}]

const addConstant = type => constants[type] = type
const addInitialState = state => initialStateBuffer.push(state)
const addHandler = (type, handler) => handlers[type] = handler
export const setNamedAsync = namedMethods =>
  Object.entries(namedMethods).forEach(([name, method]) => namedAsync[name] = method)

const setSucceeded = type => state => setState(state, 'succeeded', type, true)
const setFailed = type => state => setState(state, 'failed', type, true)
const setIsPending = type => state => setState(state, 'pending', type, true)
const setNotPending = type => state => setState(state, 'pending', type, false)
const setSSRCached = type => state => setState(state, 'ssr_cached', type, !isBrowser)

const trimPayload = payload => payload.length === 1 ? payload[0] : payload

const SUCCESS = '_SUCCESS'
const FAILURE = '_FAILURE'
const SSR_CACHE = '_SSR_CACHE'

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
  addHandler(type + SSR_CACHE, setSSRCached(type))

  if (typeof async === 'string') {
    const name = async
    if (!namedAsync[name]) throw new Error(`Named async method [${name}] has not been set by setNamedAsync`)
    async = namedAsync[name]
  }

  return (...payload) => (dispatch, getState) => {
    const state = getState()
    if (!isBrowser) dispatch({type: type + SSR_CACHE})
    if (state.ssr_cached[type] && isBrowser) return dispatch({type: type + SSR_CACHE})
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
