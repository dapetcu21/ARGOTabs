import {
  REQUEST_TOURNAMENT,
  PUBLISH_REQUEST, PUBLISH_RESPONSE,
  PUBLISH_ID_REQUEST, PUBLISH_ID_RESPONSE,
  SET_PUBLISH_PARAMS
} from '../constants/ActionTypes'

const defaultState = {
  tournamentId: null,
  id: null,
  params: { censored: true },
  lastPublished: null,
  loading: 0,
  error: null
}

export default function publish (state = defaultState, { type, payload, error }) {
  switch (type) {
    case SET_PUBLISH_PARAMS:
      return {
        ...state,
        params: payload
      }

    case REQUEST_TOURNAMENT:
      return {
        ...defaultState,
        tournamentId: payload.id || null
      }

    case PUBLISH_ID_REQUEST:
    case PUBLISH_REQUEST:
      return {
        ...state,
        loading: state.tournamentId ? state.loading + 1 : state.loading,
        error: null
      }

    case PUBLISH_RESPONSE:
    case PUBLISH_ID_RESPONSE:
      if (error) {
        return {
          ...state,
          loading: state.loading - 1,
          error: payload.toString()
        }
      }
      return {
        ...state,
        loading: state.loading - 1,
        error: null,
        params: payload.params || state.params,
        lastPublished: payload.timestamp,
        id: payload.id
      }

    default:
      return state
  }
}
