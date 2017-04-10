import { combineReducers } from 'redux'

import {
  REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1, SET_TOURNAMENT_FAILED
} from '../../constants/ActionTypes'

import eliminatories from './eliminatories'

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

const dataReducer = combineReducers({
  version: () => 2,
  v1,
  title,
  eliminatories
})

const defaultState = {
  request: null,
  isLoading: false,
  error: null,
  data: null,
  revision: -1
}

export default function tournamentReducer (state = defaultState, action) {
  const { type, payload } = action

  switch (type) {
    case REQUEST_TOURNAMENT:
      return {
        request: payload.id ? payload : null,
        isLoading: !!payload.id,
        error: null,
        data: null,
        revision: -1
      }

    case SET_TOURNAMENT_FAILED:
      return {
        request: state.request,
        isLoading: false,
        error: payload.error,
        data: null,
        revision: -1
      }

    case SET_TOURNAMENT:
      return {
        request: state.request,
        isLoading: false,
        error: null,
        data: dataReducer(undefined, action),
        revision: payload.revision || 0
      }

    default: {
      if (!state.data) { return state }
      const data = dataReducer(state.data, action)
      if (data !== state.data) {
        return { ...state, data, revision: state.revision + 1 }
      }
      return state
    }
  }
}
