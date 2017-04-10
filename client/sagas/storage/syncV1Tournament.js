import { eventChannel, channel } from 'redux-saga'
import { take, takeEvery, select, put, call, actionChannel, fork } from 'redux-saga/effects'
import isEqual from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'

import Round from '../../models/round'
import { newElimRound } from './elimRounds'

import {
  REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1,
  NEW_ROUND, NEW_ELIM_ROUND, DELETE_ROUND, DELETE_ELIM_ROUND
 } from '../../constants/ActionTypes'

import { setTournamentV1 } from '../../actions/StorageActions'
import { setTournament, getTournament, updateTournament } from '../../store/tournament-v1'

const timer = ms => eventChannel(emitter => {
  const interval = window.setInterval(() => {
    emitter({ type: 'TIMER' })
  }, ms)
  return () => { window.clearInterval(interval) }
})

function * mergeChannels (mergedChannel, channels) {
  for (let i = 0; i < channels.length; i++) {
    const currentChannel = channels[i]
    yield fork(function * () {
      while (true) {
        const action = yield take(currentChannel)
        yield put(mergedChannel, action)
      }
    })
  }
}

const pingAction = { type: 'PING' }
function * respondToAction (chan, action) {
  const { type, payload } = action

  const tournament = getTournament()
  if (!tournament) { return }

  switch (type) {
    case NEW_ROUND: {
      tournament.rounds.push(new Round(tournament))
      yield put(chan, pingAction)
      break
    }

    case DELETE_ROUND: {
      const round = tournament.rounds[payload]
      tournament.rounds.splice(payload, 1)
      round.destroy()
      yield put(chan, pingAction)
      break
    }

    case NEW_ELIM_ROUND: {
      const eliminatories = yield select(state => state.tournament.data.eliminatories)
      newElimRound(tournament, eliminatories)
      yield put(chan, pingAction)
      break
    }

    case DELETE_ELIM_ROUND: {
      const round = tournament.elimRounds.pop()
      if (!round) { break }
      round.destroy()
      yield put(chan, pingAction)
      break
    }
  }
}

export default function * syncV1TournamentSaga () {
  const timerCh = yield call(timer, 1000)
  const actionCh = yield actionChannel([REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1])
  const mergedCh = yield call(channel)
  yield fork(mergeChannels, mergedCh, [timerCh, actionCh])

  yield takeEvery('*', respondToAction, mergedCh)

  while (true) {
    const { type, payload } = yield take(mergedCh)

    if (type === REQUEST_TOURNAMENT) {
      setTournament(null)
      continue
    }

    if (type === SET_TOURNAMENT) {
      setTournament(cloneDeep(payload.data.v1))
      continue
    }

    if (type === SET_TOURNAMENT_V1) { continue }

    const v1 = getTournament()
    if (!v1) { continue }

    const v1Data = JSON.parse(JSON.stringify(v1))
    const storedV1Data = yield select(store => store.tournament.data && store.tournament.data.v1)
    if (!isEqual(v1Data, storedV1Data)) {
      updateTournament()
      yield put(setTournamentV1(v1Data))
    }
  }
}
