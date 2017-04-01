import React, { PureComponent } from 'react'
import { firebaseConnect } from 'react-redux-firebase'

@firebaseConnect([])
export default class DashboardPage extends PureComponent {
  handleLogout = () => {
    this.props.firebase.logout()
  }

  render () {
    return (
      <div>
        <div>Meow</div>
        <button onClick={this.handleLogout}>Log out</button>
      </div>
    )
  }
}
