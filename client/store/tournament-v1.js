import Tournament from '../models/tournament'

let tournament = null
let listeners = []

export function setTournament (data) {
  if (!data) {
    tournament = null
    return
  }

  tournament = new Tournament()
  tournament.loadFromModel(data)

  listeners.map(f => { f(tournament) })
}

export function getTournament () {
  return tournament
}

export function onTournament (f) {
  listeners.push(f)
  return () => {
    listeners = listeners.filter(x => x !== f)
  }
}
