import { takeEvery, put } from 'redux-saga/effects'
import { actionTypes } from 'react-redux-firebase'

import { CREATE_TOURNAMENT_RESPONSE } from '../../constants/ActionTypes'
import { createTournament } from '../../actions/StorageActions'

export default function * importV1TournamentsSaga () {
  yield takeEvery(actionTypes.LOGIN, function * () {
    for (const storageKey in window.localStorage) {
      if (!/.atab$/.test(storageKey)) { continue }
      if (window.localStorage[storageKey + '__imported']) { continue }

      try {
        let data = JSON.parse(window.localStorage[storageKey])
        let title

        if (!data.version || data.version < 2) {
          title = data.name
          data = { version: 2, v1: data }
        } else {
          title = data.title
        }

        const action = createTournament(data, title || 'Unnamed imported tournament')
        action.payload.storageKey = storageKey
        yield put(action)
      } catch (ex) {}
    }
  })

  yield takeEvery(CREATE_TOURNAMENT_RESPONSE, function * (action) {
    if (action.error) { return }
    const { storageKey } = action.payload.request
    if (!storageKey) { return }
    window.localStorage[storageKey + '__imported'] = 'true'
  })
}
