import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

@connect(state => {
  const { data } = state.tournament
  return {
    title: data && data.title
  }
})
export default class TitleBar extends PureComponent {
  render () {
    const { title } = this.props

    return (
      <Navbar fixedTop fluid>
        <Navbar.Brand>
          <Link to='/'>
            <i className='fa fa-fw fa-arrow-left' />
            &nbsp;ARGO Tabs
            {title && ` - ${title}`}
          </Link>
        </Navbar.Brand>
      </Navbar>
    )
  }
}
