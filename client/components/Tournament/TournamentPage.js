import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col, Alert } from 'react-bootstrap'

import { requestTournament } from '../../actions/StorageActions'
import styles from './TournamentPage.scss'
import Sidebar from './Sidebar'
import TournamentBody from './TournamentBody'
import TitleBar from './TitleBar'

@connect(state => {
  const { isLoading, error, data } = state.tournament
  return {
    isLoading,
    error,
    hasTournament: !!data
  }
})
export default class TournamentPage extends PureComponent {
  componentWillMount () {
    const id = this.props.match.params.tournamentId
    this.props.dispatch(requestTournament(id))
  }

  componentWillUnmount () {
    this.props.dispatch(requestTournament())
  }

  componentWillReceiveNewProps (newProps) {
    if (this.props.match.url !== newProps.match.url) {
      this.props.dispatch(requestTournament(newProps.match.params.tournamentId))
    }
  }

  renderBody () {
    const { isLoading, error, hasTournament, match } = this.props

    if (isLoading) {
      return (
        <div className={styles.initializingWall}>
          <i className='fa fa-2x fa-fw fa-spinner fa-spin' />
        </div>
      )
    }

    return (
      <Grid className={styles.bodyPadding} fluid>
        {error && (
          <Row>
            <Col xs={12}>
              <Alert bsStyle='danger'>
                <h4>Error</h4>
                <p>{error}</p>
              </Alert>
            </Col>
          </Row>
        )}
        {hasTournament && (
          <Row>
            <Col sm={2}>
              <Sidebar match={match} />
            </Col>
            <Col sm={10}>
              <TournamentBody match={match} />
            </Col>
          </Row>
        )}
      </Grid>
    )
  }

  render () {
    return (
      <div>
        <TitleBar />
        {this.renderBody()}
      </div>
    )
  }
}
