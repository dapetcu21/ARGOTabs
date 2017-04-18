import { call } from 'redux-saga/effects'

import syncV1TournamentSaga from './syncV1Tournament'
import syncTournamentSaga from './syncTournament'
import createTournamentSaga from './createTournament'
import deleteTournamentSaga from './deleteTournament'
import renameTournamentSaga from './renameTournament'
import downloadCurrentTournamentSaga from './downloadCurrentTournament'
import importV1TournamentsSaga from './importV1Tournaments'

export default function * storageSaga () {
  yield [
    call(importV1TournamentsSaga),
    call(createTournamentSaga),
    call(deleteTournamentSaga),
    call(renameTournamentSaga),
    call(syncTournamentSaga),
    call(syncV1TournamentSaga),
    call(downloadCurrentTournamentSaga)
  ]
}
