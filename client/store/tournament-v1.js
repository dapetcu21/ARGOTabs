import Tournament from '../models/tournament'

let tournament = null

export function setTournament (data) {
  if (!data) {
    tournament = null
    return
  }

  tournament = new Tournament()
  tournament.loadFromModel(data.v1)
}

export function getTournament () {
  return tournament
}
