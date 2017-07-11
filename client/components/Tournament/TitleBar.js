import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navbar, ButtonToolbar, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import PublishDialog from './PublishDialog'
import { downloadCurrentTournament } from '../../actions/TournamentActions'
import { getPublishId } from '../../actions/PublishActions'
import styles from './TitleBar.scss'

@connect(state => {
  const { data, request } = state.tournament
  return {
    title: data && data.title,
    hasData: !!data,
    hasId: !!(request && request.id)
  }
})
export default class TitleBar extends PureComponent {
  state = { publishOpen: false }

  handleDownloadClick = () => {
    this.props.dispatch(downloadCurrentTournament())
  }

  handlePublishClick = () => {
    this.setState({ publishOpen: true })
    this.props.dispatch(getPublishId())
  }

  handlePublishHide = () => {
    this.setState({ publishOpen: false })
  }

  render () {
    const { title, hasData, hasId } = this.props

    return (
      <Navbar fixedTop fluid>
        <Navbar.Brand>
          <Link to='/'>
            <i className='fa fa-fw fa-arrow-left' />
            &nbsp;ARGO Tabs
            {title && ` - ${title}`}
          </Link>
        </Navbar.Brand>
        {hasData && (
          <ButtonToolbar className={styles.toolbar}>
            <Button bsStyle='info' onClick={this.handleDownloadClick}>
              <i className='fa fa-download' />
            </Button>
            {hasId && (
              <Button bsStyle='success' onClick={this.handlePublishClick}>
                <i className='fa fa-share' />
              </Button>
            )}
          </ButtonToolbar>
        )}
        {hasData && hasId && (
          <PublishDialog
            open={this.state.publishOpen}
            onHide={this.handlePublishHide}
          />
        )}
      </Navbar>
    )
  }
}
