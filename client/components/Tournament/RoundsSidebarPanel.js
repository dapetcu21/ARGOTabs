import React, { PureComponent } from 'react'
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'

import { newRound, deleteRound } from '../../actions/TournamentActions'
import styles from './RoundsSidebarPanel.scss'

@withRouter
@connect(state => {
  const v1 = state.tournament.data.v1
  return { roundCount: v1.rounds ? v1.rounds.length : 0 }
})
export default class RoundsSidebarPanel extends PureComponent {
  handleDeleteRoundClick = index => evt => {
    const { location, url, history, dispatch } = this.props
    if (location.pathname.match(/\/rounds\/[^/]+/)) {
      history.replace(url)
    }
    dispatch(deleteRound(index))

    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  handleNewRoundClick = evt => {
    evt.preventDefault()
    this.props.dispatch(newRound())
  }

  render () {
    const { roundCount, url } = this.props

    const linkProps = {
      activeClassName: 'active',
      className: 'list-group-item'
    }

    const listItems = []
    for (let i = 0; i < roundCount; i++) {
      listItems.push(
        <NavLink key={i} exact to={`${url}/rounds/${i + 1}`} {...linkProps}>
          Round {i + 1}
          <div
            className={styles.closeButton}
            onClick={this.handleDeleteRoundClick(i)}
          >
            <i className='fa fa-fw fa-lg fa-times' />
          </div>
        </NavLink>
      )
    }

    return (
      <Panel header='In-rounds'>
        <ListGroup fill>
          {listItems}
          <ListGroupItem onClick={this.handleNewRoundClick}>
            <i className='fa fa-fw fa-plus' />
            &nbsp;New round
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}
