import { fork } from 'redux-saga/effects'

import syncV1TournamentSaga from './syncV1Tournament'
import syncTournamentSaga from './syncTournament'
import createTournamentSaga from './createTournament'
import deleteTournamentSaga from './deleteTournament'
import renameTournamentSaga from './renameTournament'
import downloadCurrentTournamentSaga from './downloadCurrentTournament'
import importV1TournamentsSaga from './importV1Tournaments'
import publishTournament from './publishTournament'

export default function * storageSaga () {
  yield fork(importV1TournamentsSaga)
  yield fork(createTournamentSaga)
  yield fork(deleteTournamentSaga)
  yield fork(renameTournamentSaga)
  yield fork(syncTournamentSaga)
  yield fork(syncV1TournamentSaga)
  yield fork(downloadCurrentTournamentSaga)
  yield fork(publishTournament)
}
