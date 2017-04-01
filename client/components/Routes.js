import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import DashboardPage from './DashboardPage'
import LoginWall from './LoginWall'

export default function Routes () {
  return (
    <Router>
      <LoginWall>
        <Route path='/' component={DashboardPage} />
      </LoginWall>
    </Router>
  )
}
