import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Modal, Alert, Button, FormGroup, InputGroup, FormControl, Checkbox } from 'react-bootstrap'
import { format } from 'date-fns'

import { publishTournament, setPublishParams } from '../../actions/PublishActions'

const getLink = id => `${window.location.origin}/published/${id}/team-rank`

@connect(state => ({
  ...state.publish
}))
export default class PublishDialog extends PureComponent {
  handlePublishClick = () => {
    const { dispatch, params } = this.props
    dispatch(publishTournament(params))
    this.setState({ copied: false })
  }

  handleCopyLinkClick = () => {
    const inputContainer = this.inputContainer
    if (!inputContainer) { return }

    const input = inputContainer.querySelector('input')
    if (input && input.select) {
      input.select()
      try {
        document.execCommand('copy')
        this.setState({ copied: true })
      } catch (ex) {
        this.setState({ copied: 'manual' })
      }
    }
  }

  handleCensoredChange = (evt) => {
    this.props.dispatch(setPublishParams({
      censored: evt.target.checked
    }))
  }

  handleHide = () => {
    this.setState({ copied: false })
    this.props.onHide()
  }

  state = { copied: false }

  render () {
    const { open, error, id, loading, params, lastPublished } = this.props
    const { copied } = this.state

    return (
      <Modal show={open} onHide={this.handleHide}>
        <Modal.Header closeButton>
          <Modal.Title>Publish tournament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Publish your tab to share a read-only copy with others. Useful, for example, for publishing the results after the tournament.</p>

          <div ref={x => { this.inputContainer = x }}>
            <FormGroup>
              <InputGroup>
                <FormControl
                  type='text'
                  value={id ? getLink(id) : ''}
                  disabled={!!loading || !id}
                />
                {(!!loading || !id) && (
                  <InputGroup.Addon>
                    <i className={loading ? 'fa fa-fw fa-spinner fa-spin' : 'fa fa-fw fa-times'} />
                  </InputGroup.Addon>
                )}
                {!loading && id && (
                  <InputGroup.Button>
                    <Button onClick={this.handleCopyLinkClick}>
                      <i className='fa fa-fw fa-clipboard' />
                    </Button>
                  </InputGroup.Button>
                )}
              </InputGroup>
            </FormGroup>
          </div>

          {(!!lastPublished || copied) && (
            <p style={{ color: '#999', marginTop: -10 }}>
              {!!lastPublished && <span>
                Last published: {format(lastPublished, 'YYYY-MM-DD HH:mm')}&nbsp;
              </span>}
              {copied && (
                <span style={{ color: '#1e6917', float: 'right' }}>
                  {copied === 'manual' ? 'Press Ctrl+C to copy link.' : 'Copied to clipboard!'}
                </span>
              )}
            </p>
          )}

          {error && (
            <Alert bsStyle='danger'>
              <h4>Error</h4>
              <p>{error}</p>
            </Alert>
          )}

          <FormGroup>
            <Checkbox
              disabled={!!loading}
              checked={params.censored}
              onChange={this.handleCensoredChange}
            >
              Censor judge ranks and judge conflicts
            </Checkbox>
          </FormGroup>

          <Button
            onClick={this.handlePublishClick}
            bsStyle='success'
            disabled={!!loading}
          >
            Publish
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
