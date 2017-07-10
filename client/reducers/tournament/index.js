import { combineReducers } from 'redux'
import uuid from 'uuid'
import isEqual from 'lodash.isequal'

import {
  REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1,
  SET_TOURNAMENT_FAILED, SAVE_TOURNAMENT_FAILED,
  SET_SYNC_CONFLICT, SOLVE_SYNC_CONFLICT_LOCAL, SOLVE_SYNC_CONFLICT_REMOTE
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
  revision: null,
  conflict: false
}

export default function tournamentReducer (state = defaultState, action) {
  const { type, payload } = action

  switch (type) {
    case REQUEST_TOURNAMENT:
      return {
        request: payload,
        isLoading: !!payload.id,
        error: null,
        data: null,
        revision: null,
        conflict: false
      }

    case SET_TOURNAMENT_FAILED:
    case SAVE_TOURNAMENT_FAILED:
      if (!isEqual(payload.request, state.request)) { return state }
      return {
        ...state,
        isLoading: false,
        error: payload.error
      }

    case SET_TOURNAMENT:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: dataReducer(undefined, action),
        revision: payload.revision
      }

    case SET_SYNC_CONFLICT:
      return {
        ...state,
        conflict: payload
      }

    case SOLVE_SYNC_CONFLICT_LOCAL:
    case SOLVE_SYNC_CONFLICT_REMOTE:
      return {
        ...state,
        conflict: false
      }

    default: {
      if (!state.data) { return state }
      const data = dataReducer(state.data, action)
      if (data !== state.data) {
        // TODO: move uuid generation in action creators
        return { ...state, data, revision: uuid.v4() }
      }
      return state
    }
  }
}
