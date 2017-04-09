import { takeEvery, select, put } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import { CREATE_TOURNAMENT, CREATE_TOURNAMENT_RESPONSE } from '../../constants/ActionTypes'

export default function * createTournamentSaga () {
  const firebase = getFirebase()

  yield takeEvery(CREATE_TOURNAMENT, function * (action) {
    const { title, tournament } = action.payload

    const auth = yield select(state => pathToJS(state.firebase, 'auth'))
    if (!auth) { return }
    const { uid } = auth

    const db = firebase.database()
    const ref = db.ref()
    const newKey = ref.child('tournaments').push().key
    const lastModified = firebase.database.ServerValue.TIMESTAMP
    const revision = 0

    try {
      yield ref.update({
        [`/tournaments/${newKey}`]: {
          owner: uid,
          data: JSON.stringify(tournament),
          lastModified,
          revision
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
