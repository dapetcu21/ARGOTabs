import { combineReducers } from 'redux'

import { LOGOUT, REQUEST_TOURNAMENT, SET_TOURNAMENT } from '../../constants/ActionTypes'

const tournamentReducer = combineReducers({
  foo: () => 'bar'
})

export default function tournamentOrNull (state = null, action) {
  const { type } = action
  if (state) {
    if (type === REQUEST_TOURNAMENT || type === LOGOUT) { return null }
    return tournamentReducer(state, action)
  }

  if (type === SET_TOURNAMENT) {
    return tournamentReducer(undefined, action)
  }

  return null
}
