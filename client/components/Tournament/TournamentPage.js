import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button, Grid, Row, Col, Alert } from 'react-bootstrap'

import { requestTournament, solveSyncConflictLocal, solveSyncConflictRemote } from '../../actions/StorageActions'
import styles from './TournamentPage.scss'
import Sidebar from './Sidebar'
import TournamentBody from './TournamentBody'
import TitleBar from './TitleBar'

@connect(state => {
  const { isLoading, error, conflict, data } = state.tournament
  return {
    isLoading,
    error,
    conflict,
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

  handleSolveLocalClick = () => {
    this.props.dispatch(solveSyncConflictLocal())
  }

  handleSolveRemoteClick = () => {
    this.props.dispatch(solveSyncConflictRemote())
  }

  renderBody () {
    const { isLoading, error, hasTournament, conflict, match } = this.props

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
        {conflict && (
          <Row>
            <Col xs={12}>
              <Alert bsStyle='danger'>
                <h4>Data diverged</h4>
                <p>Changes made in the cloud diverged from unsaved local changes. Keep local data and discard cloud data or keep cloud data and discard local data?</p>
                <div style={{ marginTop: 10 }}>
                  <Button bsStyle='danger' onClick={this.handleSolveLocalClick} style={{ marginRight: 10 }}>
                    Keep local data
                  </Button>
                  <Button bsStyle='danger' onClick={this.handleSolveRemoteClick}>
                    Keep cloud data
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        )}
        {hasTournament && (
          <Row>
            <Col sm={2} className={styles.sidebarColumn}>
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
