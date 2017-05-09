
# Sleipnir

A convenience interface for Redux, to remove boilerplate and provide sensible asynchronous action handling. 

## How to use


Install via `npm i -S sleipnir` or `yarn add sleipnir`.

Create your actions. Example: 

```js
// actions.js
import {createAction} from 'sleipnir'

export const getUsers = createAction('GET_USERS', {
  initialState: {users: []},
  async: () => fetchUsers(),
  handler: (state, {payload: users}) => ({
    ...state, 
    users: users.map(({id, name}) => ({id, name}))
  })
})

export const getUser = createAction('GET_USER', {
  async: ({id}) => fetchUser(id), 
  handler: (state, {payload: user}) => ({
    ...state, 
    user
  })
})

export const setFormValue = createAction('SET_FORM_VALUE', {
  handler: (state, {payload: [field, value]}) => ({
    ...state,
    form: {
      ...state.form,
      [field]: value
    }
  })
})
```

Pass the reducer to redux: 

```js
import { createStore, applyMiddleware } from 'redux'
import reducer, {middleware} from './store'

const createStoreWithMiddleware = applyMiddleware(middleware)(createStore)

const store = createStoreWithMiddleware(reducer)
```

Done. 