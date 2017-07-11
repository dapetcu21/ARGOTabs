import { createAction } from 'redux-actions'
import {
  PUBLISH_REQUEST, PUBLISH_RESPONSE,
  PUBLISH_ID_REQUEST, PUBLISH_ID_RESPONSE,
  SET_PUBLISH_PARAMS
} from '../constants/ActionTypes'

export const publishTournament = createAction(PUBLISH_REQUEST,
  ({ censored }) => ({ censored })
)

export const setPublishParams = createAction(SET_PUBLISH_PARAMS,
  ({ censored }) => ({ censored })
)

export const getPublishId = createAction(PUBLISH_ID_REQUEST,
  (tournamentId) => ({ tournamentId })
)

export const publishTournamentResponse = createAction(PUBLISH_RESPONSE)
export const getPublishIdResponse = createAction(PUBLISH_ID_RESPONSE)
