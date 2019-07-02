
# Sleipnir

A tiny, zero-dependency convenience interface for Redux, to remove boilerplate and provide sensible asynchronous action handling.

Requires `redux-thunk` middleware.

## How to use

Install via `npm i -S sleipnir` or `yarn add sleipnir`.

Create your actions. Example:

```js
// actions.js
import {createAction, setState} from 'sleipnir'

const normalizeUsers = users => users.map(({id, name}) => ({id, name}))
// The full createAction API in use
// Args of setState are state, followed by keys/indices/functions to set state
export const getUsers = createAction('GET_USERS', {
  initialState: {users: []},
  async: _ => fetchUsers(),
  handler: (state, users) =>
    setState(state, 'users', normalizeUsers),
  errorHandler: (state, _, error) =>
    setState(state, 'errors', 'users', error),
})

export const getUser = createAction('GET_USER', {
  async: ({id}) => fetchUser(id),
  handler: (state, user) =>
    setState(state, 'user', user)
})

export const setFormValue = createAction('SET_FORM_VALUE', {
  handler: (state, [field, value]) =>
    setState(state, 'form', field, value)
})
```

Pass the reducer to redux (make sure you use the `redux-thunk` middleware):

```js
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from 'sleipnir'

const configureStore = initialState =>
  createStore(reducer, initialState, applyMiddleware(thunk))

const store = configureStore({})
```

And away you go!

### Useful stuff

Since `createAction` creates its own reducer handler, you can create actions and reducers dynamically/conditionally during runtime, without affecting the redux store operation in any way. So you can easily colocate your action/reducers with your views/logic, and extend your app without touching the central redux store.

Initial state is seeded with three root keys: `pending`, `succeeded`, and `failed`. Async actions will set their state in these, keyed by their constant, like so:

```js
{
  pending: {
    GET_USER: true
  }
}
```
You can display loading status in your app from this state, like so:

```js
import {useSelector} from 'react-redux'
import {createSelector} from 'sleipnir'

 // Args of createSelector are keys/indices/functions to traverse state to the desired value
const getPending = createSelector('pending', p => Object.values(p).some(Boolean))
const getPendingUser = createSelector('pending', 'GET_USER')

const Loading = props => {
  const globalLoading = useSelector(getPending)
  const loadingUser = useSelector(getPendingUser)
  const message = globalLoading ? 'Loading...' : loadingUser ? 'Loading user...' : 'Done'
  return (
    <div>{message}</div>
  )
}
```

Similarly, `succeeded` and `failed` can be useful for displaying error or success messages, or whatever your application requires.
