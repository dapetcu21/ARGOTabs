import { createAction } from 'redux-actions'
import {
  NEW_ROUND, NEW_ELIM_ROUND, DELETE_ROUND, DELETE_ELIM_ROUND,
  SET_BREAKING_SLOTS, SET_ELIGIBLE_FOR_BREAK,
  DOWNLOAD_CURRENT_TOURNAMENT
} from '../constants/ActionTypes'

export const newRound = createAction(NEW_ROUND)
export const newElimRound = createAction(NEW_ELIM_ROUND)
export const deleteRound = createAction(DELETE_ROUND)
export const deleteElimRound = createAction(DELETE_ELIM_ROUND)
export const setBreakingSlots = createAction(SET_BREAKING_SLOTS)
export const setEligibleForBreak = createAction(SET_ELIGIBLE_FOR_BREAK,
  (teamId, eligible) => ({ teamId, eligible })
)
export const downloadCurrentTournament = createAction(DOWNLOAD_CURRENT_TOURNAMENT)
