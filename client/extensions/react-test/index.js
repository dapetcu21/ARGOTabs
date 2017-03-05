import React, { Component } from 'react'

class ReactTest extends Component {
  handleButton = () => {
    this.props.dispatch(() => {
      this.props.tournament.name += '_'
    })
  }

  render () {
    return (
      <div>
        <div>This is a React component</div>
        <div>Tournament name: {this.props.tournament.name}</div>
        <button onClick={this.handleButton}>Change name</button>
      </div>
    )
  }
}

export default class ReactTestRoute {
  route = () => '/react-test'
  reactComponent = () => ReactTest
}
