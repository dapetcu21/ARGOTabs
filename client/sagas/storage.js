import { eventChannel, END } from 'redux-saga'
import { take, takeEvery, select, fork, put, call, cancelled } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import {
  CREATE_TOURNAMENT, CREATE_TOURNAMENT_RESPONSE, REQUEST_TOURNAMENT,
} from '../constants/ActionTypes'

import { setTournament } from '../actions/StorageActions'

function * createTournamentSaga () {
  const firebase = getFirebase()

  yield takeEvery(CREATE_TOURNAMENT, function * (action) {
    const { title, tournament } = action.payload

    const auth = yield select(state => pathToJS(state.firebase, 'auth'))
    if (!auth) { return }
    const { uid } = auth

    const ref = firebase.database().ref()
    const newKey = ref.child('tournaments').push().key
    const lastModified = Date.now()

    try {
      yield ref.update({
        [`/tournaments/${newKey}`]: {
          owner: uid,
          data: tournament,
          lastModified
        },
        [`/tournamentMetadata/${newKey}`]: {
          owner: uid,
          title,
          lastModified
        }
      })
    } catch (ex) {
      yield put({
        type: CREATE_TOURNAMENT_RESPONSE,
        payload: {
          request: action.payload,
          error: ex
        },
        error: true
      })
      return
    }

    yield put({
      type: CREATE_TOURNAMENT_RESPONSE,
      payload: { request: action.payload }
    })
  })
}

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

function * requestTournamentSaga () {
  const firebase = getFirebase()
  let task = null

  while (true) {
    const { payload } = yield take(REQUEST_TOURNAMENT)

    if (task) {
      task.cancel()
      task = null
    }

    if (payload.id) {
      const ref = firebase.database().ref().child('tournaments').child(payload.id)
      task = yield fork(subscribeToFirebaseRef, ref, function * (snapshot) {
        yield put(setTournament({
          request: payload,
          ...snapshot.val()
        }))
      })
    }
  }
}

export default function * storageSaga () {
  yield [
    createTournamentSaga(),
    requestTournamentSaga()
  ]
}
