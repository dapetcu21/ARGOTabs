import syncV1TournamentSaga from './syncV1Tournament'
import syncTournamentSaga from './syncTournament'
import createTournamentSaga from './createTournament'
import downloadCurrentTournamentSaga from './downloadCurrentTournament'

export default function * storageSaga () {
  yield [
    createTournamentSaga(),
    syncTournamentSaga(),
    syncV1TournamentSaga(),
    downloadCurrentTournamentSaga()
  ]
}
