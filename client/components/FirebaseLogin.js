import React, { Component } from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

@firebaseConnect([])
export default class FirebaseLogin extends Component {
  uiConfig = {
    callbacks: {
      signInSuccess: (user, credential, redirectUrl) => {
        console.log('Authenticated', user)
        return false
      }
    },
    signInFlow: 'popup',
    signInOptions: [{
      provider: this.props.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: ['https://www.googleapis.com/auth/plus.login']
    }, {
      provider: this.props.firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      scopes: ['public_profile', 'email']
    }]
  }

  ui = new firebaseui.auth.AuthUI(this.props.firebase.auth())

  componentDidMount () {
    this.ui.start('#firebase-login-ui', this.uiConfig)
  }

  componentWillUnmount () {
    this.ui.reset()
  }

  render () {
    return (
      <div id='firebase-login-ui'>Test</div>
    )
  }
}
