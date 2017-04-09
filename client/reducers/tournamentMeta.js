import { handleActions } from 'redux-actions'

import { LOGOUT, REQUEST_TOURNAMENT, SET_TOURNAMENT } from '../constants/ActionTypes'

const defaultState = {
  request: null,
  isLoading: false,
  error: null,
  lastModified: null
}

export default handleActions({
  [REQUEST_TOURNAMENT]: (state, { payload }) => ({
    request: payload.id ? payload : null,
    isLoading: !!payload.id,
    error: null,
    lastModified: null
  }),

  [SET_TOURNAMENT]: (state, { payload }) => ({
    ...state,
    isLoading: false,
    error: null,
    lastModified: payload.lastModified
  }),

  [LOGOUT]: () => defaultState
}, defaultState)
