import React, { PureComponent } from 'react'
import AngularTemplate from 'react-angular'
import { withTournament } from '../../store/tournament-v1'

import styles from './AngularExtensionWrapper.scss'

export default (angularRoute, extraScope = {}) => {
  const routeOpts = window.ARGOTabs.extensions.getRouteOpts(angularRoute)

  @withTournament({ update: false })
  class AngularExtensionWrapper extends PureComponent {
    render () {
      const { match, tournament } = this.props

      if (!tournament) { return <div /> }

      const scope = {
        tournament,
        uncloak: false,
        routeParams: match.params,
        ...extraScope
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
