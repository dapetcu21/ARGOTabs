import { takeEvery, select, put } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import { DELETE_TOURNAMENT, DELETE_TOURNAMENT_RESPONSE } from '../../constants/ActionTypes'

export default function * deleteTournamentSaga () {
  const firebase = getFirebase()

  yield takeEvery(DELETE_TOURNAMENT, function * (action) {
    const { tournamentId } = action.payload

    const auth = yield select(state => pathToJS(state.firebase, 'auth'))
    if (!auth) { return }
    const { uid } = auth

    const db = firebase.database()
    const ref = db.ref()

    try {
      yield ref.update({
        [`/tournaments/${tournamentId}`]: null,
        [`/publishData/${tournamentId}`]: null,
        [`/tournamentsByOwner/${uid}/${tournamentId}`]: null
      })
    } catch (ex) {
      yield put({
        type: DELETE_TOURNAMENT_RESPONSE,
        payload: {
          request: action.payload,
          error: ex
        },
        error: true
      })
      return
    }

    yield put({
      type: DELETE_TOURNAMENT_RESPONSE,
      payload: { request: action.payload }
    })
  })
}
