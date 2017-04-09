import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Navbar, Grid, Row, Col, Alert } from 'react-bootstrap'

import { requestTournament } from '../../actions/StorageActions'
import styles from './TournamentPage.scss'
import Sidebar from './Sidebar'
import TournamentBody from './TournamentBody'

@connect(state => ({
  isLoading: state.tournamentMeta.isLoading,
  error: state.tournamentMeta.error,
  hasTournament: !!state.tournament
}))
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
              <TournamentBody />
            </Col>
          </Row>
        )}
      </Grid>
    )
  }

  render () {
    return (
      <div>
        <Navbar fixedTop fluid>
          <Navbar.Brand>
            <Link to='/'>
              <i className='fa fa-fw fa-arrow-left' />
              &nbsp;ARGO Tabs
            </Link>
          </Navbar.Brand>
        </Navbar>
        {this.renderBody()}
      </div>
    )
  }
}
