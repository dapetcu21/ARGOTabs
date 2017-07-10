import { channel } from 'redux-saga'
import { select, put, call, take, spawn } from 'redux-saga/effects'
import { getFirebase, pathToJS } from 'react-redux-firebase'

import {
  setTournament, setTournamentFailed, saveTournamentFailed, setSyncConflict
} from '../../actions/StorageActions'

const DEACTIVATE = 0
const ACTIVATE = 1
const REMOTE_UPDATE = 2
const LOCAL_UPDATE = 3
const SAVED = 4
const SAVED_FAILED = 5
const SOLVE = 6

export const deactivateReconciler = () => ({ type: DEACTIVATE })
export const activateReconciler = () => ({ type: ACTIVATE })
export const remoteUpdate = (revision, snapshot) =>
  ({ type: REMOTE_UPDATE, revision, snapshot })
export const localUpdate = (revision, data) =>
  ({ type: LOCAL_UPDATE, revision, data })
export const dataSaved = (revision) => ({ type: SAVED, revision })
export const dataSavedFailed = (revision) => ({ type: SAVED_FAILED })
export const solveConflict = (local) => ({ type: SOLVE, local })

function getLocalStorage (tournamentId, key) {
  try {
    return JSON.parse(window.localStorage.getItem(`tabs:${tournamentId}:${key}`))
  } catch (ex) {
    return null
  }
}

function setLocalStorage (tournamentId, key, data, raw = false) {
  try {
    window.localStorage.setItem(`tabs:${tournamentId}:${key}`, raw ? data : JSON.stringify(data))
  } catch (ex) {}
}

// If we don't delay setTournament to the next tick, actions arrive out of order
// in other sagas for some reason
function nextTick () {
  return new Promise(resolve => {
    window.setTimeout(() => {
      resolve()
    })
  })
}

function * syncReconcilerSaga (chan, tournamentId) {
  let retainCount = 1
  let active = true

  let conflict = false
  let conflictRevision = null
  let conflictData = null
  function * setConflict (value, revision, data) {
    if (conflict === value) { return }
    conflict = value
    conflictRevision = revision
    conflictData = data
    if (active) {
      yield put(setSyncConflict(value))
    }
  }

  let knownRemoteRevision = getLocalStorage(tournamentId, 'knownRemoteRevision')
  let savingRemoteRevision = knownRemoteRevision

  let storedRevision = getLocalStorage(tournamentId, 'revision')
  let storedData = getLocalStorage(tournamentId, 'data')

  const request = { id: tournamentId }

  if (storedRevision && storedData) {
    yield nextTick()
    yield put(setTournament({ request, revision: storedRevision, data: storedData }))
  }

  function * uploadRemote () {
    retainCount++
    savingRemoteRevision = storedRevision
    yield spawn(saveTournament, tournamentId, knownRemoteRevision, savingRemoteRevision, storedData, chan)
  }

  if (storedRevision !== knownRemoteRevision) {
    yield uploadRemote()
  }

  while (retainCount > 0) {
    const action = yield take(chan)

    switch (action.type) {
      case ACTIVATE: {
        active = true
        if (storedRevision && storedData) {
          yield nextTick()
          yield put(setTournament({ request, revision: storedRevision, data: storedData }))
        }
        if (conflict) {
          yield put(setSyncConflict(true))
        }
        break
      }

      case REMOTE_UPDATE: {
        const { revision, snapshot } = action

        if (!knownRemoteRevision) {
          knownRemoteRevision = savingRemoteRevision = revision
          setLocalStorage(tournamentId, 'knownRemoteRevision', revision)
        }

        if (storedRevision && (revision === knownRemoteRevision || revision === savingRemoteRevision)) {
          yield setConflict(false)
          break
        }

        if (!storedRevision || (knownRemoteRevision === savingRemoteRevision && savingRemoteRevision === storedRevision)
        ) {
          const rawData = snapshot.val()
          let data = null
          try {
            data = JSON.parse(rawData)
          } catch (ex) {
            yield put(setTournamentFailed({ request, error: ex.toString() }))
            break
          }

          knownRemoteRevision = savingRemoteRevision = storedRevision = revision
          storedData = data
          setLocalStorage(tournamentId, 'knownRemoteRevision', revision)
          setLocalStorage(tournamentId, 'revision', revision)
          setLocalStorage(tournamentId, 'data', rawData, true)
          yield setConflict(false)
          if (active) {
            yield put(setTournament({ request, revision, data }))
          }
          break
        }

        yield setConflict(true, revision, snapshot.val())
        break
      }

      case LOCAL_UPDATE: {
        const { revision, data } = action

        setLocalStorage(tournamentId, 'revision', revision)
        setLocalStorage(tournamentId, 'data', data)
        storedRevision = revision
        storedData = data

        if (!conflict && knownRemoteRevision === savingRemoteRevision) {
          yield uploadRemote()
        }

        break
      }

      case SAVED: {
        retainCount--

        const { revision } = action
        if (revision !== savingRemoteRevision) { continue }

        knownRemoteRevision = revision
        setLocalStorage(tournamentId, 'knownRemoteRevision', revision)

        if (!conflict && knownRemoteRevision !== storedRevision) {
          yield uploadRemote()
        }

        break
      }

      case SAVED_FAILED: {
        retainCount--
        savingRemoteRevision = knownRemoteRevision
        break
      }

      case SOLVE: {
        if (!conflict) { break }
        conflict = false

        if (action.local) {
          savingRemoteRevision = knownRemoteRevision = conflictRevision
          setLocalStorage(tournamentId, 'knownRemoteRevision', knownRemoteRevision)
          if (knownRemoteRevision !== storedRevision) {
            yield uploadRemote()
          }
        } else {
          let data = null
          try {
            data = JSON.parse(conflictData)
          } catch (ex) { break }

          knownRemoteRevision = savingRemoteRevision = storedRevision = conflictRevision
          storedData = data
          setLocalStorage(tournamentId, 'knownRemoteRevision', conflictRevision)
          setLocalStorage(tournamentId, 'revision', conflictRevision)
          setLocalStorage(tournamentId, 'data', conflictData, true)
          if (active) {
            yield put(setTournament({ request, revision: conflictRevision, data }))
          }
        }

        break
      }

      case DEACTIVATE: {
        retainCount--
        active = false
        break
      }
    }
  }

  cache.delete(tournamentId)
}

function * saveTournament (tournamentId, fromRevision, toRevision, data, chan) {
  const firebase = getFirebase()
  const db = firebase.database()
  const ref = db.ref()

  const auth = yield select(state => pathToJS(state.firebase, 'auth'))
  if (!auth) { return }
  const { uid } = auth

  let jsonData = null

  try {
    const tournamentRef = ref.child('tournaments').child(tournamentId)
    const { snapshot } = yield tournamentRef.transaction(existingData => {
      if (!existingData && fromRevision) { return existingData }
      const revision = (existingData && existingData.revision) || null
      if ((fromRevision || null) !== revision) {
        return
      }

      if (!jsonData) { jsonData = JSON.stringify(data) }

      return {
        revision: toRevision,
        lastModified: firebase.database.ServerValue.TIMESTAMP,
        owner: uid,
        data: jsonData
      }
    }, () => {}, false)

    if (snapshot.child('revision').val() !== toRevision) {
      yield put(chan, dataSavedFailed())
      return
    }

    yield ref.child('tournamentsByOwner').child(uid).child(tournamentId).child('lastModified').set(
      snapshot.child('lastModified').val()
    )
  } catch (error) {
    yield put(saveTournamentFailed({ request: { id: tournamentId }, error }))
    yield put(chan, dataSavedFailed())
    return
  }

  yield put(chan, dataSaved(toRevision))
}

const cache = new Map()
export function * getReconciler (tournamentId) {
  let chan = cache.get(tournamentId)
  if (chan) {
    yield put(chan, activateReconciler())
    return chan
  }

  chan = yield call(channel)
  cache.set(tournamentId, chan)
  yield spawn(syncReconcilerSaga, chan, tournamentId)

  return chan
}
