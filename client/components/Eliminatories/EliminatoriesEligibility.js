import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Table, Checkbox } from 'react-bootstrap'

import { setEligibleForBreak } from '../../actions/TournamentActions'
import styles from './EliminatoriesEligibility.scss'

import { withTournament } from '../../store/tournament-v1'
import Team from '../../models/team'

@connect(state => ({
  breakingSlots: state.tournament.data.eliminatories.breakingSlots,
  uneligibleTeams: state.tournament.data.eliminatories.uneligibleTeams
}))
@withTournament()
export default class EliminatoriesSidebar extends PureComponent {
  handleToggleEligibleForBreak = (id, value) => () => {
    this.props.dispatch(setEligibleForBreak(id, !value))
  }

  render () {
    const { tournament, breakingSlots, uneligibleTeams } = this.props
    if (!tournament) { return <div /> }

    const teams = tournament.teams.slice(0)
    Team.calculateStats(teams, tournament.rounds)

    const sorter = tournament.teamRankSorter.boundComparator()
    teams.sort((a, b) => sorter(a.stats, b.stats))

    let skippedSoFar = 0

    return (
      <div>
        <p>Please deselect teams that are not eligible for the break</p>
        <Table bordered responsive className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Team name</th>
              <th>Eligible for break</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => {
              const eligible = !uneligibleTeams.has(team.id)
              if (!eligible) { skippedSoFar++ }
              const rank = index + 1 - skippedSoFar
              const highlighted = eligible && (rank <= breakingSlots)

              return (
                <tr key={team.id} className={highlighted ? styles.highlighted : ''}>
                  <td>{eligible && rank}</td>
                  <td>{team.name}</td>
                  <td>
                    <Checkbox
                      value={eligible}
                      onChange={this.handleToggleEligibleForBreak(team.id, eligible)}
                      className={styles.checkbox}
                      inline
                    >
                      <span className={eligible ? styles.eligible : styles.uneligible}>
                        {eligible ? 'Eligible' : 'Not eligible'}
                      </span>
                    </Checkbox>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
}
