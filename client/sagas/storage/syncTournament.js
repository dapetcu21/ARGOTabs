import { eventChannel, END } from 'redux-saga'
import { take, fork, put, call, select, cancelled } from 'redux-saga/effects'
import { getFirebase } from 'react-redux-firebase'

import { REQUEST_TOURNAMENT, SET_TOURNAMENT } from '../../constants/ActionTypes'
import { setTournament, setTournamentFailed, saveTournamentFailed } from '../../actions/StorageActions'

function makeFirebaseRefChannel (ref) {
  return eventChannel(emitter => {
    ref.on('value', emitter, (error) => {
      console.error(error)
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

function * saveTournament (firebase, request, data, revision) {
  const db = firebase.database()
  const ref = db.ref()

  const tournamentId = request.id
  const lastModified = firebase.database.ServerValue.TIMESTAMP

  try {
    yield ref.update({
      [`/tournaments/${tournamentId}/revision`]: revision,
      [`/tournaments/${tournamentId}/lastModified`]: lastModified,
      [`/tournamentMetadata/${tournamentId}/lastModified`]: lastModified,
      [`/tournaments/${tournamentId}/data`]: JSON.stringify(data)
    })
  } catch (error) {
    yield put(saveTournamentFailed({ request, error }))
  }
}

export default function * syncTournamentSaga () {
  const firebase = getFirebase()
  let fetchTask = null
  let pushTask = null

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

    if (payload.id) {
      const ref = firebase.database().ref().child('tournaments').child(payload.id)
      fetchTask = yield fork(subscribeToFirebaseRef, ref, function * (snapshot) {
        if (snapshot.exists()) {
          const recievedRevision = snapshot.child('revision').val() || 0
          const currentRevision = yield select(state => state.tournament.revision)
          if (recievedRevision > currentRevision) {
            const newPayload = snapshot.val()
            newPayload.data = JSON.parse(newPayload.data)
            newPayload.request = payload
            yield put(setTournament(newPayload))
          }
        } else {
          yield put(setTournamentFailed({
            request: payload,
            error: 'Tournament not found'
          }))
        }
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

          const oldTournament = tournament
          const { revision, data: newTournament } = yield select(state => state.tournament)
          tournament = newTournament

          if (tournament === null) { continue }

          if (tournament !== oldTournament) {
            yield fork(saveTournament, firebase, payload, newTournament, revision)
          }
        }
      })
    }
  }
}
