import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Well, FormControl } from 'react-bootstrap'

import { setBreakingSlots } from '../../actions/TournamentActions'
import styles from './EliminatoriesSidebar.scss'

@connect(state => ({
  breakingSlots: state.tournament.data.eliminatories.breakingSlots
}))
export default class EliminatoriesSidebar extends PureComponent {
  handleBreakingSlotsChange = evt => {
    this.props.dispatch(setBreakingSlots(evt.target.value))
  }

  render () {
    const { breakingSlots } = this.props

    return (
      <Well>
        <div className={styles.settingsGroupHeader}>
          No. breaking teams:
        </div>
        <FormControl
          componentClass='select'
          placeholder='select'
          value={breakingSlots}
          onChange={this.handleBreakingSlotsChange}
          >
          <option value={2}>2 (Break to final)</option>
          <option value={4}>4 (Semi-finals)</option>
          <option value={8}>8 (Quarter-finals)</option>
          <option value={16}>16 (Octo-finals)</option>
          <option value={32}>32 (16th-finals)</option>
        </FormControl>
      </Well>
    )
  }
}
