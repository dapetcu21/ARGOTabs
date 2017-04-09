import { handleActions } from 'redux-actions'

import { REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_FAILED } from '../constants/ActionTypes'

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

  [SET_TOURNAMENT_FAILED]: (state, { payload }) => ({
    ...state,
    isLoading: false,
    error: payload.error
  })
}, defaultState)
