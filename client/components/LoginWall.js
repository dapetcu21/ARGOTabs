import React, { Component } from 'react'
import FirebaseLogin from './FirebaseLogin'
import { pathToJS } from 'react-redux-firebase'
import { connect } from 'react-redux'

@connect(({ firebase }) => ({
  isInitializing: pathToJS(firebase, 'isInitializing'),
  authError: pathToJS(firebase, 'authError'),
  auth: pathToJS(firebase, 'auth')
}))
export default class LoginWall extends Component {
  render () {
    const { authError, isInitializing, auth } = this.props
    console.log('Firebase auth', authError, auth, isInitializing)
    return (
      <FirebaseLogin />
    )
  }
}
