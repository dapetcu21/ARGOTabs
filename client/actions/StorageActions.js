import { createAction } from 'redux-actions'
import {
  CREATE_TOURNAMENT, CREATE_TOURNAMENT_RESPONSE,
  REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1, SET_TOURNAMENT_FAILED
} from '../constants/ActionTypes'

export const createTournament = createAction(CREATE_TOURNAMENT,
  (tournament, title) => ({ tournament, title })
)

export const createTournamentResponse = createAction(CREATE_TOURNAMENT_RESPONSE)

export const requestTournament = createAction(REQUEST_TOURNAMENT,
  (id) => ({ id })
)

export const setTournament = createAction(SET_TOURNAMENT)
export const setTournamentFailed = createAction(SET_TOURNAMENT_FAILED)
export const setTournamentV1 = createAction(SET_TOURNAMENT_V1,
  (v1) => ({ v1, timestamp: Date.now() })
)
