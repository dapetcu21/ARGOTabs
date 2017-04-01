import React, { Component } from 'react'
import { firebaseConnect, pathToJS } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { Row, Col, Button, Alert } from 'react-bootstrap'

import styles from './FirebaseLogin.scss'

@firebaseConnect([])
@connect(({ firebase }) => ({
  authError: pathToJS(firebase, 'authError')
}))
export default class FirebaseLogin extends Component {
  handleLoginWithGoogle = () => {
    this.props.firebase.login({
      provider: 'google',
      type: 'popup'
    })
  }

  handleLoginWithFacebook = () => {
    this.props.firebase.login({
      provider: 'facebook',
      type: 'popup'
    })
  }

  render () {
    const { authError } = this.props

    return (
      <div>
        {authError && (
          <Alert bsStyle='danger'>
            <h4>Could not log in</h4>
            <p>{authError.message}</p>
          </Alert>
        )}
        <Row>
          <Col sm={6}>
            <Button onClick={this.handleLoginWithGoogle} className={styles.loginButton}>
              <i className='fa fa-fw fa-google' />
              Login with Google
            </Button>
          </Col>
          <Col sm={6}>
            <Button onClick={this.handleLoginWithFacebook} className={styles.loginButton}>
              <i className='fa fa-fw fa-facebook' />
              Login with Facebook
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
