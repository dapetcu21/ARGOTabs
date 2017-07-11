import { takeEvery, take, fork, put, select } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import {
  PUBLISH_REQUEST, PUBLISH_ID_REQUEST, REQUEST_TOURNAMENT
} from '../../constants/ActionTypes'

import { publishTournamentResponse, getPublishIdResponse } from '../../actions/PublishActions'

function * publishIdRequestSaga (tournamentId, { payload }) {
  const firebase = getFirebase()
  const db = firebase.database()

  try {
    const publishData = (yield db.ref(`/publishData/${tournamentId}`).once('value')).val()

    if (!publishData) {
      yield put(getPublishIdResponse({
        timestamp: null,
        id: null,
        params: null
      }))
    } else {
      const { timestamp, id, params } = publishData
      yield put(getPublishIdResponse({ timestamp, id, params }))
    }
  } catch (ex) {
    const action = getPublishIdResponse(ex)
    action.error = true
    yield put(action)
  }
}

function * publishRequestSaga (tournamentId, { payload }) {
  const firebase = getFirebase()
  const db = firebase.database()

  try {
    const auth = yield select(state => pathToJS(state.firebase, 'auth'))
    if (!auth) { throw new Error('Needs authentication') }
    const { uid } = auth

    const data = yield select(state => state.tournament.data)
    if (!data) { throw new Error('No tournament data to publish') }

    let publishId = (yield db.ref(`/publishData/${tournamentId}/id`).once('value')).val()
    if (!publishId) { publishId = db.ref('/publishedTournaments').push().key }

    yield db.ref().update({
      [`/publishData/${tournamentId}/id`]: publishId,
      [`/publishData/${tournamentId}/timestamp`]: firebase.database.ServerValue.TIMESTAMP,
      [`/publishData/${tournamentId}/params`]: payload,
      [`/publishedTournaments/${publishId}/owner`]: uid,
      [`/publishedTournaments/${publishId}/data`]: JSON.stringify(data)
    })

    yield put(publishTournamentResponse({
      timestamp: (yield db.ref(`/publishData/${tournamentId}/timestamp`).once('value')).val() || Date.now(),
      id: publishId,
      params: payload
    }))
  } catch (ex) {
    const action = publishTournamentResponse(ex)
    action.error = true
    yield put(action)
  }
}

export default function * publishTournamentSaga () {
  let task = null

  while (true) {
    const { payload: request } = yield take(REQUEST_TOURNAMENT)

    if (task) {
      task.cancel()
      task = null
    }

    if (!request.id) { continue }

    task = yield fork(function * () {
      yield takeEvery(PUBLISH_ID_REQUEST, publishIdRequestSaga, request.id)
      yield takeEvery(PUBLISH_REQUEST, publishRequestSaga, request.id)
    })
  }
}
