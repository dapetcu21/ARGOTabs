import syncV1TournamentSaga from './syncV1Tournament'
import syncTournamentSaga from './syncTournament'
import createTournamentSaga from './createTournament'

export default function * storageSaga () {
  yield [
    createTournamentSaga(),
    syncTournamentSaga(),
    syncV1TournamentSaga()
  ]
}
