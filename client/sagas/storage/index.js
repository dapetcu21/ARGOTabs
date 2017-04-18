import syncV1TournamentSaga from './syncV1Tournament'
import syncTournamentSaga from './syncTournament'
import createTournamentSaga from './createTournament'
import deleteTournamentSaga from './deleteTournament'
import renameTournamentSaga from './renameTournament'
import downloadCurrentTournamentSaga from './downloadCurrentTournament'

export default function * storageSaga () {
  yield [
    createTournamentSaga(),
    deleteTournamentSaga(),
    renameTournamentSaga(),
    syncTournamentSaga(),
    syncV1TournamentSaga(),
    downloadCurrentTournamentSaga()
  ]
}
