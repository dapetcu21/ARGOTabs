import { createAction } from 'redux-actions'
import {
  NEW_ROUND, NEW_ELIM_ROUND, DELETE_ROUND, SET_BREAKING_SLOTS,
  SET_ELIGIBLE_FOR_BREAK
} from '../constants/ActionTypes'

export const newRound = createAction(NEW_ROUND)
export const deleteRound = createAction(DELETE_ROUND)
export const newElimRound = createAction(NEW_ELIM_ROUND)
export const setBreakingSlots = createAction(SET_BREAKING_SLOTS)
export const setEligibleForBreak = createAction(SET_ELIGIBLE_FOR_BREAK,
  (teamId, eligible) => ({ teamId, eligible })
)
