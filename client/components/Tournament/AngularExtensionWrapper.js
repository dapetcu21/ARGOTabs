import React, { PureComponent } from 'react'
import AngularTemplate from 'react-angular'
import { getTournament, onTournament } from '../../store/tournament-v1'

import styles from './AngularExtensionWrapper.scss'

export default (angularRoute) => {
  const routeOpts = window.ARGOTabs.extensions.getRouteOpts(angularRoute)

  class AngularExtensionWrapper extends PureComponent {
    state = { tournament: getTournament() }

    componentWillMount () {
      this.clearSubscription = onTournament(tournament => {
        this.setState({ tournament })
      })
    }

    componentWillUnmount () {
      this.clearSubscription()
    }

    render () {
      const { tournament } = this.state
      if (!tournament) { return <div /> }

      const scope = {
        tournament: this.state.tournament,
        uncloak: false
      }

      const template = `<div class="${styles.cloak} AngularExtensionWrapper__uncloak_{{uncloak}}">${routeOpts.template}</div>`

      return (
        <AngularTemplate
          scope={scope}
          template={template}
          controller={routeOpts.controller}
        />
      )
    }
  }

  return AngularExtensionWrapper
}
