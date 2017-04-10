import React from 'react'
import { Panel, ListGroup } from 'react-bootstrap'
import { Route, NavLink } from 'react-router-dom'

import RoundsSidebarPanel from './RoundsSidebarPanel'

export default function Sidebar (props) {
  const match = props.match
  const url = match.url
  const linkProps = {
    activeClassName: 'active',
    className: 'list-group-item'
  }

  return (
    <div>
      <Panel header='Tournament'>
        <ListGroup fill>
          <NavLink exact to={`${url}`} {...linkProps}>Dashboard</NavLink>
        </ListGroup>
      </Panel>
      <Panel header='Participants'>
        <ListGroup fill>
          <NavLink exact to={`${url}/clubs`} {...linkProps}>Clubs</NavLink>
          <NavLink exact to={`${url}/teams`} {...linkProps}>Teams</NavLink>
          <NavLink exact to={`${url}/judges`} {...linkProps}>Judges</NavLink>
          <NavLink exact to={`${url}/rooms`} {...linkProps}>Rooms</NavLink>
        </ListGroup>
      </Panel>
      <Panel header='Statistics'>
        <ListGroup fill>
          <NavLink exact to={`${url}/team-rank`} {...linkProps}>Team rank</NavLink>
          <NavLink exact to={`${url}/speaker-rank`} {...linkProps}>Speaker rank</NavLink>
        </ListGroup>
      </Panel>
      <RoundsSidebarPanel url={url} />
    </div>
  )
}
