import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import {
  ListGroupItem, Modal, MenuItem,
  DropdownButton, Button, ButtonGroup,
  FormGroup, FormControl
} from 'react-bootstrap'

import styles from './TournamentListItem.scss'
import { deleteTournament, renameTournament } from '../actions/StorageActions'

@withRouter
@connect()
export default class TournamentListItem extends PureComponent {
  state = { deleteOpen: false, renaming: false, newTitle: '' }

  handleTournamentClick = evt => {
    console.log(evt.target)
    evt.preventDefault()
    const { history, tournamentId } = this.props
    history.push(`/edit/${tournamentId}`)
  }

  focusInput () {
    if (this.input) {
      this.input.focus()
      this.input.setSelectionRange(0, this.state.newTitle.length)
    }
  }

  handleDropdownSelect = eventKey => {
    if (eventKey === 'delete') {
      this.setState({ deleteOpen: true })
      return
    }
    if (eventKey === 'rename') {
      this.setState({ renaming: true, newTitle: this.props.metadata.title })
      this.focusInput()
    }
  }

  handleDropdownContainerClick = evt => {
    evt.preventDefault()
    evt.stopPropagation()
  }

  handleModalHide = () => {
    this.setState({ deleteOpen: false })
  }

  handleDeleteConfirm = () => {
    const { dispatch, tournamentId } = this.props
    dispatch(deleteTournament(tournamentId))
  }

  handleTitleChange = evt => {
    this.setState({ newTitle: evt.target.value })
  }

  handleRenameCancel = () => {
    this.setState({ renaming: false })
  }

  handleRenameConfirm = evt => {
    evt.preventDefault()
    const { dispatch, tournamentId } = this.props
    const { newTitle } = this.state
    if (!newTitle.length) { return }
    dispatch(renameTournament(tournamentId, newTitle))
    this.setState({ renaming: false })
  }

  handleInputRef = input => {
    this.input = input
    if (this.state.renaming) { this.focusInput() }
  }

  renderModal () {
    const { metadata } = this.props
    const { deleteOpen } = this.state

    return (
      <Modal show={deleteOpen} onHide={this.handleModalHide}>
        <Modal.Header closeButton>
          <Modal.Title>Delete tournament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{metadata.title}</strong> permanently?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleModalHide}>Cancel</Button>
          <Button bsStyle='primary' onClick={this.handleDeleteConfirm}>Delete</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  renderRenaming () {
    const { newTitle } = this.state

    return (
      <ListGroupItem className={styles.listGroupItemRename}>
        <form className={styles.form} onSubmit={this.handleRenameConfirm}>
          <FormGroup
            validationState={newTitle.length ? null : 'error'}
            className={styles.formGroup}
          >
            <FormControl
              type='text'
              bsSize='small'
              value={newTitle}
              inputRef={this.handleInputRef}
              placeholder='Enter tournament title'
              onChange={this.handleTitleChange}
            />
          </FormGroup>
          <ButtonGroup>
            <Button
              bsStyle='danger'
              bsSize='small'
              onClick={this.handleRenameCancel}
            >
              <i className='fa fa-fw fa-times' />
            </Button>
            <Button
              type='submit'
              bsStyle='success'
              bsSize='small'
              onClick={this.handleRenameConfirm}
            >
              <i className='fa fa-fw fa-check' />
            </Button>
          </ButtonGroup>
        </form>
      </ListGroupItem>
    )
  }

  render () {
    const { tournamentId, metadata } = this.props
    const { deleteOpen, renaming } = this.state

    if (renaming) {
      return this.renderRenaming()
    }

    return (
      <ListGroupItem
        className={styles.listGroupItem}
        onClick={this.handleTournamentClick}
      >
        <div className={styles.title}>
          <i className='fa fa-fw fa-file-o' />&nbsp;
          {metadata.title}
        </div>
        <div onClick={this.handleDropdownContainerClick}>
          <DropdownButton
            id={`dropdown-${tournamentId}`}
            bsSize='small'
            title={<i className='fa fa-ellipsis-v' />}
            onSelect={this.handleDropdownSelect}
            noCaret
          >
            <MenuItem eventKey='rename'>Rename</MenuItem>
            <MenuItem eventKey='delete'>Delete</MenuItem>
          </DropdownButton>
        </div>
        {deleteOpen && this.renderModal()}
      </ListGroupItem>
    )
  }
}
