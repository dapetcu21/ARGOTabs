import React, { PureComponent } from 'react'
import { Panel, Modal, Button, ListGroup, ListGroupItem } from 'react-bootstrap'
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
  state = { roundBeingDeleted: null }

  handleDeleteRoundConfirm = () => {
    const { location, url, history, dispatch } = this.props
    if (location.pathname.match(/\/rounds\/[^/]+/)) {
      history.replace(url)
    }
    dispatch(deleteRound(this.state.roundBeingDeleted))
    this.setState({ roundBeingDeleted: null })
  }

  handleNewRoundClick = evt => {
    evt.preventDefault()
    this.props.dispatch(newRound())
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

  render () {
    const { roundCount, url } = this.props
    const { roundBeingDeleted } = this.state

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
      <div>
        <Panel header='In-rounds'>
          <ListGroup fill>
            {listItems}
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
            <ListGroupItem onClick={this.handleNewElimRound}>
              <i className='fa fa-fw fa-plus' />
              &nbsp;New out-round
            </ListGroupItem>
          </ListGroup>
        </Panel>

        <Modal
          show={roundBeingDeleted !== null}
          onHide={this.handleModalHide}
          bsSize='small'
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete Round {roundBeingDeleted + 1}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete Round {roundBeingDeleted + 1}?</p>
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
