import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import LegacyTabRedirect from './LegacyTabRedirect'
import TournamentList from './TournamentList'
import TournamentPage from './Tournament/TournamentPage'
import NotFoundPage from './NotFoundPage'
import LoginWall from './LoginWall'

export default function Routes () {
  return (
    <Router>
      <Route render={({ location }) => (
        <LegacyTabRedirect location={location}>
          <Switch>
            <Route path='/remote/:remoteUrl' component={TournamentPage} />
            <Route path='/published/:publishId' component={TournamentPage} />
            <Route render={() => (
              <LoginWall location={location}>
                <Switch>
                  <Route path='/' exact component={TournamentList} />
                  <Route path='/edit/:tournamentId' component={TournamentPage} />
                  <Route component={NotFoundPage} />
                </Switch>
              </LoginWall>
            )} />
          </Switch>
        </LegacyTabRedirect>
      )} />
    </Router>
  )
}
