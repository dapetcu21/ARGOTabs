import React, { PureComponent } from 'react'
import AngularTemplate from 'react-angular'
import { withTournament } from '../../store/tournament-v1'
import { connect } from 'react-redux';

import styles from './AngularExtensionWrapper.scss'

export default (angularRoute, extraScope = {}) => {
  const routeOpts = window.ARGOTabs.extensions.getRouteOpts(angularRoute)

  @withTournament({ update: false })
  @connect()
  class AngularExtensionWrapper extends PureComponent {
    render () {
      const { match, tournament, dispatch } = this.props

      if (!tournament) { return <div /> }

      const scope = {
        tournament,
        uncloak: false,
        routeParams: match.params,
        dispatch,
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
