import { createAction } from 'redux-actions'
import {
  NEW_ROUND, NEW_ELIM_ROUND, DELETE_ROUND, DELETE_ELIM_ROUND,
  SET_BREAKING_SLOTS, SET_ELIGIBLE_FOR_BREAK,
  DOWNLOAD_CURRENT_TOURNAMENT,

  NEW_ROOM, UPDATE_ROOM, DELETE_ROOM,
  NEW_CLUB, UPDATE_CLUB, DELETE_CLUB,
  NEW_TEAM, UPDATE_TEAM, DELETE_TEAM,
  NEW_PLAYER, UPDATE_PLAYER, DELETE_PLAYER,
  NEW_JUDGE, UPDATE_JUDGE, DELETE_JUDGE,
  ASSIGN_JUDGE_TO_CLUB, ASSIGN_TEAM_TO_CLUB
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

export const newRoom = createAction(NEW_ROOM)
export const updateRoom = createAction(UPDATE_ROOM, (id, patch) => ({ id, patch }))
export const deleteRoom = createAction(DELETE_ROOM, (id) => ({ id }))

export const newJudge = createAction(NEW_JUDGE)
export const updateJudge = createAction(UPDATE_JUDGE, (id, patch) => ({ id, patch }))
export const deleteJudge = createAction(DELETE_JUDGE, (id) => ({ id }))

export const newTeam = createAction(NEW_TEAM)
export const updateTeam = createAction(UPDATE_TEAM, (id, patch) => ({ id, patch }))
export const deleteTeam = createAction(DELETE_TEAM, (id) => ({ id }))

export const newPlayer = createAction(NEW_PLAYER, (teamId) => ({ teamId }))
export const updatePlayer = createAction(UPDATE_PLAYER, (id, patch) => ({ id, patch }))
export const deletePlayer = createAction(DELETE_PLAYER, (id, teamId) => ({ id, teamId }))

export const newClub = createAction(NEW_CLUB)
export const updateClub = createAction(UPDATE_CLUB, (id, patch) => ({ id, patch }))
export const deleteClub = createAction(DELETE_CLUB, (id) => ({ id }))

export const assignJudgeToClub = createAction(ASSIGN_JUDGE_TO_CLUB, (judgeId, clubId) => ({ judgeId, clubId }))
export const assignTeamToClub = createAction(ASSIGN_TEAM_TO_CLUB, (judgeId, clubId) => ({ judgeId, clubId }))
