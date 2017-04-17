import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navbar, ButtonToolbar, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { downloadCurrentTournament } from '../../actions/TournamentActions'
import styles from './TitleBar.scss'

@connect(state => {
  const { data } = state.tournament
  return {
    title: data && data.title,
    hasData: !!data
  }
})
export default class TitleBar extends PureComponent {
  handleDownloadClick = () => {
    this.props.dispatch(downloadCurrentTournament())
  }

  render () {
    const { title, hasData } = this.props

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
          </ButtonToolbar>
        )}
      </Navbar>
    )
  }
}
