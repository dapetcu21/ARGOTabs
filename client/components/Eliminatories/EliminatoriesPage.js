import React, { PureComponent } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import EliminatoriesSidebar from './EliminatoriesSidebar'
import EliminatoriesEligibility from './EliminatoriesEligibility'

export default class EliminatoriesPage extends PureComponent {
  render () {
    return (
      <Grid fluid>
        <Row>
          <Col sm={8} md={9}>
            <EliminatoriesEligibility />
          </Col>
          <Col sm={4} md={3}>
            <EliminatoriesSidebar />
          </Col>
        </Row>
      </Grid>
    )
  }
}
