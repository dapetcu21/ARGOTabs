import React, { PureComponent } from 'react'
import { Panel, Modal, Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'

import { newRound, newElimRound, deleteRound, deleteElimRound } from '../../actions/TournamentActions'
import styles from './RoundsSidebarPanel.scss'

import { canCreateNewElimRound, elimRoundName } from '../../sagas/storage/elimRounds'

@withRouter
@connect(state => {
  const tournament = state.tournament.data
  const v1 = tournament.v1
  return {
    v1,
    roundCount: v1.rounds ? v1.rounds.length : 0,
    elimRoundCount: v1.elimRounds ? v1.elimRounds.length : 0,
    eliminatories: tournament.eliminatories
  }
})
export default class RoundsSidebarPanel extends PureComponent {
  state = { roundBeingDeleted: null }

  handleDeleteRoundConfirm = () => {
    const { location, url, history, dispatch } = this.props
    if (location.pathname.match(/\/(rounds|eliminatories)\/[^/]+/)) {
      history.replace(url)
    }
    const { roundBeingDeleted } = this.state
    if (roundBeingDeleted === 'elim') {
      dispatch(deleteElimRound())
    } else {
      dispatch(deleteRound(roundBeingDeleted))
    }
    this.setState({ roundBeingDeleted: null })
  }

  handleNewRoundClick = evt => {
    evt.preventDefault()
    this.props.dispatch(newRound())
  }

  handleNewElimRoundClick = evt => {
    evt.preventDefault()
    this.props.dispatch(newElimRound())
  }

  handleModalHide = () => {
    this.setState({ roundBeingDeleted: null })
  }

  handleDeleteRoundClick = index => evt => {
    this.setState({ roundBeingDeleted: index })
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  handleDeleteElimRoundClick = evt => {
    this.setState({ roundBeingDeleted: 'elim' })
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  render () {
    const { roundCount, elimRoundCount, eliminatories, v1, url } = this.props
    const { breakingSlots } = eliminatories
    const { roundBeingDeleted } = this.state

    const linkProps = {
      activeClassName: 'active',
      className: 'list-group-item'
    }

    const roundItems = []
    for (let i = 0; i < roundCount; i++) {
      roundItems.push(
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

    const elimRoundItems = []
    for (let i = 0; i < elimRoundCount; i++) {
      elimRoundItems.push(
        <NavLink key={i} exact to={`${url}/eliminatories/${i + 1}`} {...linkProps}>
          {elimRoundName(breakingSlots, i)}
          {i === elimRoundCount - 1 && (
            <div
              className={styles.closeButton}
              onClick={this.handleDeleteElimRoundClick}
            >
              <i className='fa fa-fw fa-lg fa-times' />
            </div>
          )}
        </NavLink>
      )
    }

    const deletedTitle = roundBeingDeleted === null
      ? ''
      : roundBeingDeleted === 'elim'
        ? elimRoundName(breakingSlots, elimRoundCount - 1, true)
        : `round ${roundBeingDeleted + 1}`

    return (
      <div>
        <Panel header='In-rounds'>
          <ListGroup fill>
            {roundItems}
            <ListGroupItem onClick={this.handleNewRoundClick}>
              <i className='fa fa-fw fa-plus' />
              &nbsp;New round
            </ListGroupItem>
          </ListGroup>
        </Panel>

        <Panel header='Eliminatories'>
          <ListGroup fill>
            <NavLink exact to={`${url}/eliminatories`} {...linkProps}>
              Setup
            </NavLink>
            {elimRoundItems}
            {canCreateNewElimRound(v1, eliminatories) && (
              <ListGroupItem onClick={this.handleNewElimRoundClick}>
                <i className='fa fa-fw fa-plus' />
                &nbsp;New {elimRoundName(breakingSlots, elimRoundCount, true)}
              </ListGroupItem>
            )}
          </ListGroup>
        </Panel>

        <Modal
          show={roundBeingDeleted !== null}
          onHide={this.handleModalHide}
          bsSize='small'
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete {deletedTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete {deletedTitle}?</p>
            <p>
              This will remove the pairing, all ballots and all scores associated with this round.
              Most mistakes can be corrected without deleting the whole round.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleModalHide}>Cancel</Button>
            <Button bsStyle='primary' onClick={this.handleDeleteRoundConfirm}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
