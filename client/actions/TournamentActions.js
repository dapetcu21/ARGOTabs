import { createAction } from 'redux-actions'
import { NEW_ROUND, DELETE_ROUND } from '../constants/ActionTypes'

export const newRound = createAction(NEW_ROUND)
export const deleteRound = createAction(DELETE_ROUND)
