import { takeEvery, select } from 'redux-saga/effects'

import { DOWNLOAD_CURRENT_TOURNAMENT } from '../../constants/ActionTypes'

function download (fileName, text) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', fileName)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

export default function * downloadCurrentTournamentSaga () {
  yield takeEvery(DOWNLOAD_CURRENT_TOURNAMENT, function * () {
    const data = yield select(state => state.tournament.data)
    if (!data) { return }

    const fileName = `${data.title}.atab`
    download(fileName, JSON.stringify(data))
  })
}
