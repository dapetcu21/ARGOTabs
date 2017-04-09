import { combineReducers } from 'redux'

import { REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1 } from '../../constants/ActionTypes'

function title (state = null, { type, payload }) {
  if (type === SET_TOURNAMENT) {
    return payload.data.title || payload.data.v1.name || 'Untitled tournament'
  }
  if (type === SET_TOURNAMENT_V1) {
    return payload.v1.name || state || 'Untitled tournament'
  }
  return state
}

function v1 (state = {}, { type, payload }) {
  if (type === SET_TOURNAMENT) {
    return payload.data.v1 || {}
  }
  if (type === SET_TOURNAMENT_V1) {
    return payload.v1
  }
  return state
}

const tournamentReducer = combineReducers({
  version: () => 2,
  v1,
  title
})

export default function tournamentOrNull (state = null, action) {
  const { type } = action
  if (state) {
    if (type === REQUEST_TOURNAMENT) { return null }
    return tournamentReducer(state, action)
  }

  if (type === SET_TOURNAMENT) {
    return tournamentReducer(undefined, action)
  }

  return null
}
