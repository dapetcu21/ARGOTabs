import React, { PureComponent } from 'react'
import FirebaseLogin from './FirebaseLogin'
import { pathToJS } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { Grid, Row, Col, Alert } from 'react-bootstrap'

import styles from './LoginWall.scss'

@connect(({ firebase }) => ({
  isInitializing: pathToJS(firebase, 'isInitializing'),
  auth: pathToJS(firebase, 'auth')
}))
export default class LoginWall extends PureComponent {
  render () {
    const { isInitializing, auth, children } = this.props

    if (isInitializing || auth === undefined) {
      return (
        <div className={styles.initializingWall}>
          <i className='fa fa-2x fa-fw fa-spinner fa-spin' />
        </div>
      )
    }

    if (auth) {
      return children
    }

    return (
      <Grid>
        <Row style={{ marginTop: '40px' }}>
          <Col md={6} mdOffset={3} sm={8} smOffset={2}>
            <h1 style={{ textAlign: 'center' }}>Welcome to ARGO Tabs!</h1>
            <Alert bsStyle='info'>
              ARGO Tabs now stores your tabs in the cloud. Log in to find your
              tabs exactly where you left them.
            </Alert>
            <FirebaseLogin />
          </Col>
        </Row>
      </Grid>
    )
  }
}
