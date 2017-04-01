import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import DashboardPage from './DashboardPage'

export default function Routes () {
  return (
    <Router>
      <Route path='/' component={DashboardPage} />
    </Router>
  )
}
