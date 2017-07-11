import { eventChannel, END } from 'redux-saga'
import { take, fork, put, call, select, cancelled } from 'redux-saga/effects'
import { getFirebase } from 'react-redux-firebase'
import uuid from 'uuid'

import {
  REQUEST_TOURNAMENT, SET_TOURNAMENT, SOLVE_SYNC_CONFLICT_LOCAL, SOLVE_SYNC_CONFLICT_REMOTE
} from '../../constants/ActionTypes'

import { setTournament, setTournamentFailed } from '../../actions/StorageActions'
import { convertFromLegacy } from '../../store/legacy'
import { getReconciler, deactivateReconciler, remoteUpdate, localUpdate, solveConflict } from './syncReconciler'

function makeFirebaseRefChannel (ref) {
  return eventChannel(emitter => {
    ref.on('value', emitter, (error) => {
      emitter({ error })
      emitter(END)
    })

    return () => {
      ref.off('value', emitter)
    }
  })
}

function * subscribeToFirebaseRef (ref, sagaToRun) {
  const channel = yield call(makeFirebaseRefChannel, ref)
  try {
    while (true) {
      const snapshot = yield take(channel)
      yield fork(sagaToRun, snapshot)
    }
  } finally {
    if (yield cancelled()) {
      channel.close()
    }
  }
}

export default function * syncTournamentSaga () {
  const firebase = getFirebase()
  let fetchTask = null
  let pushTask = null
  let reconciler = null

  while (true) {
    const { payload } = yield take(REQUEST_TOURNAMENT)

    if (fetchTask) {
      fetchTask.cancel()
      fetchTask = null
    }

    if (pushTask) {
      pushTask.cancel()
      pushTask = null
    }

    if (reconciler) {
      yield put(reconciler, deactivateReconciler())
      reconciler = null
    }

    if (payload.remoteUrl) {
      fetchTask = yield fork(function * () {
        try {
          const request = yield window.fetch(payload.remoteUrl)
          const data = convertFromLegacy(yield request.json())

          yield put(setTournament({
            request: payload,
            data,
            revision: uuid.v4(),
            readOnly: true
          }))
        } catch (ex) {
          yield put(setTournamentFailed({
            request: payload,
            error: ex.toString()
          }))
        }
      })
      continue
    }

    if (payload.publishId) {
      fetchTask = yield fork(function * () {
        try {
          const ref = firebase.database().ref(`/publishedTournaments/${payload.publishId}/data`)
          const jsonData = (yield ref.once('value')).val()
          if (!jsonData) { throw new Error('Published tournament not found') }

          const data = JSON.parse(jsonData)

          yield put(setTournament({
            request: payload,
            data,
            revision: uuid.v4(),
            readOnly: true
          }))
        } catch (ex) {
          yield put(setTournamentFailed({
            request: payload,
            error: ex.toString()
          }))
        }
      })
      continue
    }

    if (!payload.id) { continue }

    reconciler = yield call(getReconciler, payload.id)

    const ref = firebase.database().ref().child('tournaments').child(payload.id)
    fetchTask = yield fork(subscribeToFirebaseRef, ref, function * (snapshot) {
      if (snapshot.error) {
        yield put(setTournamentFailed({
          request: payload,
          error: snapshot.error.toString()
        }))
        return
      }

      if (!snapshot.exists()) {
        yield put(setTournamentFailed({
          request: payload,
          error: 'Tournament not found'
        }))
        return
      }

      const recievedRevision = snapshot.child('revision').val()
      const recievedData = snapshot.child('data')
      yield put(reconciler, remoteUpdate(recievedRevision, recievedData))
    })

    pushTask = yield fork(function * () {
      let tournament = null

      while (true) {
        const { type } = yield take('*')

        if (type === SET_TOURNAMENT) {
          tournament = yield select(state => state.tournament.data)
          continue
        }

        if (tournament === null) { continue }

        if (type === SOLVE_SYNC_CONFLICT_LOCAL) {
          yield put(reconciler, solveConflict(true))
          continue
        }

        if (type === SOLVE_SYNC_CONFLICT_REMOTE) {
          yield put(reconciler, solveConflict(false))
          continue
        }

        const oldTournament = tournament
        const { revision, data: newTournament } = yield select(state => state.tournament)
        tournament = newTournament

        if (tournament === null) { continue }

        if (tournament !== oldTournament) {
          yield put(reconciler, localUpdate(revision, newTournament))
        }
      }
    })
  }
}
