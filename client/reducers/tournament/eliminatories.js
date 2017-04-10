import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import get from 'lodash.get'
import { Set } from 'immutable'

import { SET_TOURNAMENT, SET_BREAKING_SLOTS, SET_ELIGIBLE_FOR_BREAK } from '../../constants/ActionTypes'

const defaultBreakingSlots = 8
const breakingSlots = handleActions({
  [SET_TOURNAMENT]: (state, { payload }) =>
    get(payload.data, ['eliminatories', 'breakingSlots'], defaultBreakingSlots),
  [SET_BREAKING_SLOTS]: (state, { payload }) => payload
}, defaultBreakingSlots)

const uneligibleTeams = handleActions({
  [SET_TOURNAMENT]: (state, { payload }) =>
    Set(get(payload.data, ['eliminatories', 'uneligibleTeams'], [])),
  [SET_ELIGIBLE_FOR_BREAK]: (state, { payload }) => {
    const { teamId, eligible } = payload
    return eligible ? state.remove(teamId) : state.add(teamId)
  }
}, Set())

export default combineReducers({
  breakingSlots,
  uneligibleTeams
})
