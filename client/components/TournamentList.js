import React, { PureComponent } from 'react'
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { Grid, Row, Col, Button, Alert, ListGroup, ListGroupItem } from 'react-bootstrap'
import { withRouter } from 'react-router'

import { createTournament } from '../actions/StorageActions'
import styles from './TournamentList.scss'

@withRouter
@firebaseConnect([
  '/tournamentMetadata'
])
@connect(({ firebase }) => ({
  auth: pathToJS(firebase, 'auth'),
  list: dataToJS(firebase, '/tournamentMetadata')
}))
export default class TournamentList extends PureComponent {
  handleLogout = () => {
    this.props.firebase.logout()
  }

  handleUploadClick = () => {
    this.setState({ uploadError: null })
    this.upload.click()
  }

  addNewTab (data, title) {
    this.props.dispatch(createTournament(data, title))
  }

  handleFileUpload = evt => {
    const file = evt.target.files[0]
    if (!file) { return }

    const reader = new window.FileReader()
    reader.onload = () => {
      let data
      try {
        data = JSON.parse(reader.result)
      } catch (ex) {
        this.setState({ uploadError: ex.toString() })
      }

      if (data) {
        let title
        if (!data.version || data.version < 2) {
          title = data.name
          data = { version: 2, v1: data }
        } else {
          title = data.title
        }
        this.addNewTab(data, title || 'Unnamed tournament')
      }
    }
    reader.readAsText(file)
  }

  handleTournamentClick = tournamentId => evt => {
    evt.preventDefault()
    this.props.history.push(`/edit/${tournamentId}`)
  }

  state = {
    uploadError: null
  }

  render () {
    const { auth, list } = this.props
    const { uploadError } = this.state

    const keys = list ? Object.keys(list) : []
    keys.sort((a, b) => list[b].lastModified - list[a].lastModified)

    return (
      <Grid>
        <Row style={{ marginTop: '40px' }}>
          <Col md={4} mdOffset={4} sm={6} smOffset={3}>
            <div
              className={styles.avatar}
              style={auth.photoURL ? {
                backgroundImage: `url(${auth.photoURL})`
              } : {}}
            />
            <h4 className={styles.profileName}>
              {auth.displayName || ' '}
            </h4>
            <Button onClick={this.handleLogout} className={styles.signOutButton}>
              <i className='fa fa-sign-out' />&nbsp;
              Sign out
            </Button>

            <Row>
              <Col xs={12}>
                <ListGroup>
                  {keys.map(tournamentId => {
                    const meta = list[tournamentId]
                    return (
                      <ListGroupItem
                        key={tournamentId}
                        onClick={this.handleTournamentClick(tournamentId)}
                      >
                        <i className='fa fa-fw fa-file-o' />&nbsp;
                        {meta.title}
                      </ListGroupItem>
                    )
                  })}
                </ListGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={6}>
                <Button
                  className={styles.addButton} bsStyle='primary'
                >
                  <i className='fa fa-plus-circle' />&nbsp;
                  New tournament
                </Button>
              </Col>
              <Col xs={6}>
                <Button
                  className={styles.addButton}
                  onClick={this.handleUploadClick}
                >
                  <i className='fa fa-upload' />&nbsp;
                  Upload tab file
                </Button>
                <input
                  type='file'
                  ref={x => { this.upload = x }}
                  style={{ display: 'none' }}
                  onChange={this.handleFileUpload}
                />
              </Col>
            </Row>
            {uploadError && (
              <Row style={{ marginTop: '12px' }}>
                <Col xs={12}>
                  <Alert bsStyle='danger'>
                    <h4>Could not upload file</h4>
                    <p>{uploadError}</p>
                  </Alert>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Grid>
    )
  }
}
