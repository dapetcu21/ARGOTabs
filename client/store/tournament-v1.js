import Tournament from '../models/tournament'
import React, { Component } from 'react'

let tournament = null
let setListeners = []
let updateListeners = []

export function setTournament (data) {
  if (!data) {
    tournament = null
    return
  }

  tournament = new Tournament()
  tournament.loadFromModel(data)

  setListeners.map(f => { f(tournament) })
}

export function updateTournament () {
  updateListeners.map(f => { f(tournament) })
}

export function getTournament () {
  return tournament
}

export function onTournamentSet (f) {
  setListeners.push(f)
  return () => {
    setListeners = setListeners.filter(x => x !== f)
  }
}

export function onTournamentUpdate (f) {
  updateListeners.push(f)
  return () => {
    updateListeners = updateListeners.filter(x => x !== f)
  }
}

export const withTournament = (opts = {}) => WrappedComponent => {
  const listenToUpdate = !(opts.update === false)

  class WithTournamentWrapper extends Component {
    state = { tournament: getTournament() }

    componentWillMount () {
      this.clearSetSubscription = onTournamentSet(tournament => {
        this.setState({ tournament })
      })
      if (listenToUpdate) {
        this.clearUpdateSubscription = onTournamentUpdate(tournament => {
          this.setState({ tournament })
        })
      }
    }

    componentWillUnmount () {
      this.clearSetSubscription()
      if (this.clearUpdateSubscription) { this.clearUpdateSubscription() }
    }

    render () {
      return <WrappedComponent {...this.props} tournament={this.state.tournament} />
    }
  }

  return WithTournamentWrapper
}
