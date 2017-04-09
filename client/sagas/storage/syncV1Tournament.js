import { eventChannel, channel } from 'redux-saga'
import { take, select, put, call, actionChannel, fork } from 'redux-saga/effects'
import isEqual from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'

import { REQUEST_TOURNAMENT, SET_TOURNAMENT, SET_TOURNAMENT_V1 } from '../../constants/ActionTypes'

import { setTournamentV1 } from '../../actions/StorageActions'
import { setTournament, getTournament } from '../../store/tournament-v1'

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

export default function * syncV1TournamentSaga () {
  const timerCh = yield call(timer, 1000)
  const actionCh = yield actionChannel('*')
  const mergedCh = yield call(channel)
  yield fork(mergeChannels, mergedCh, [timerCh, actionCh])

  while (true) {
    const { type, payload } = yield take(mergedCh)

    if (type === REQUEST_TOURNAMENT) {
      setTournament(null)
      continue
    }

    if (type === SET_TOURNAMENT) {
      setTournament(cloneDeep(payload.data))
      continue
    }

    if (type === SET_TOURNAMENT_V1) { continue }

    const v1 = getTournament()
    if (!v1) { continue }

    const v1Data = JSON.parse(JSON.stringify(v1))
    const storedV1Data = yield select(store => store.tournament.data && store.tournament.data.v1)
    if (!isEqual(v1Data, storedV1Data)) {
      yield put(setTournamentV1(v1Data))
    }
  }
}
