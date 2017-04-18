import { takeEvery, select, put } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import { RENAME_TOURNAMENT, RENAME_TOURNAMENT_RESPONSE } from '../../constants/ActionTypes'

export default function * renameTournamentSaga () {
  const firebase = getFirebase()

  yield takeEvery(RENAME_TOURNAMENT, function * (action) {
    const { tournamentId, title } = action.payload

    const auth = yield select(state => pathToJS(state.firebase, 'auth'))
    if (!auth) { return }
    const { uid } = auth

    const db = firebase.database()
    const ref = db.ref()

    try {
      yield ref.update({
        [`/tournamentsByOwner/${uid}/${tournamentId}/title`]: title
      })
    } catch (ex) {
      yield put({
        type: RENAME_TOURNAMENT_RESPONSE,
        payload: {
          request: action.payload,
          error: ex
        },
        error: true
      })
      return
    }

    yield put({
      type: RENAME_TOURNAMENT_RESPONSE,
      payload: { request: action.payload }
    })
  })
}
