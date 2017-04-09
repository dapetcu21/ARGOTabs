import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import TournamentList from './TournamentList'
import TournamentPage from './Tournament/TournamentPage'
import NotFoundPage from './NotFoundPage'
import LoginWall from './LoginWall'

export default function Routes () {
  return (
    <Router>
      <Route render={({ location }) => (
        <LoginWall location={location}>
            <Switch>
              <Route path='/' exact component={TournamentList} />
              <Route path='/edit/:tournamentId' component={TournamentPage} />
              <Route component={NotFoundPage} />
            </Switch>
        </LoginWall>
      )} />
    </Router>
  )
}
