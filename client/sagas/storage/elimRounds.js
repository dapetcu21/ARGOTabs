import Team from '../../models/team'
import Round from '../../models/round'

const namesUpper = {
  32: '16th-finals',
  16: 'Octo-finals',
  8: 'Quarter-finals',
  4: 'Semi-finals',
  2: 'Finals'
}

const namesLower = {
  32: '16th-finals',
  16: 'octo-finals',
  8: 'quarter-finals',
  4: 'semi-finals',
  2: 'finals'
}

export function elimRoundName (breakingSlots, index, lowerCase = false) {
  const slots = breakingSlots / Math.pow(2, index)
  return lowerCase ? namesLower[slots] : namesUpper[slots]
}

function getWinner (ballot) {
  if (!ballot.locked) { return null }
  if (ballot.presence[0] && !ballot.presence[1]) { return ballot.teams[0] }
  if (!ballot.presence[0] && ballot.presence[1]) { return ballot.teams[1] }
  if (!ballot.presence[0] && !ballot.presence[1]) { return null }

  const { prop, opp } = ballot.votes.reduce((acc, { prop, opp }) => ({
    prop: prop + acc.prop,
    opp: opp + acc.opp
  }), { prop: 0, opp: 0 })
  return prop > opp ? ballot.teams[0] : ballot.teams[1]
}

export function canCreateNewElimRound (tournament, { uneligibleTeams, breakingSlots }) {
  const elimRoundCount = tournament.elimRounds ? tournament.elimRounds.length : 0
  if (!tournament.teams) { return }

  if (!elimRoundCount) {
    const eligibleTeamCount = tournament.teams.reduce((acc, team) =>
      !uneligibleTeams.has(team.id) ? acc + 1 : acc
    , 0)
    return eligibleTeamCount >= breakingSlots
  }

  const slots = breakingSlots / Math.pow(2, elimRoundCount)
  if (slots < 2) { return false }

  const prevRound = tournament.elimRounds[elimRoundCount - 1]
  const ballots = prevRound.ballots
  return !ballots.find(ballot => {
    const winner = getWinner(ballot)
    return winner === null || winner === undefined || winner === -1
  })
}

export function newElimRound (tournament, { uneligibleTeams, breakingSlots }) {
  let teams
  const elimRoundCount = tournament.elimRounds.length

  if (!elimRoundCount) {
    teams = tournament.teams.slice(0)
    Team.calculateStats(teams, tournament.rounds)

    const sorter = tournament.teamRankSorter.boundComparator()
    teams.sort((a, b) => sorter(a.stats, b.stats))

    teams = teams.filter(team => !uneligibleTeams.has(team.id))
    teams = teams.slice(0, breakingSlots)
  } else {
    const prevRound = tournament.elimRounds[elimRoundCount - 1]
    const ballots = prevRound.ballots.slice(0)
    ballots.sort((a, b) => a.skillIndex - b.skillIndex)
    teams = ballots.map(ballot => {
      const winner = getWinner(ballot)
      if (!winner) {
        throw new Error('Not all ballots for previous eliminatory round are entered')
      }
      return winner
    })
  }

  const slots = breakingSlots / Math.pow(2, elimRoundCount)

  if (teams.length !== slots) {
    throw new Error('Incorrect number of teams for eliminatory round')
  }

  const round = new Round(tournament)
  round.eliminatory = true
  tournament.elimRounds.push(round)

  tournament.teams.forEach(team => {
    team.rounds[round.id].participates = false
  })
  teams.forEach(team => {
    team.rounds[round.id].participates = true
  })

  const manualPairing = []
  for (let i = 0, j = slots - 1; i < j; i++, j--) {
    manualPairing.push({ prop: teams[i], opp: teams[j] })
  }

  round.pair({
    algorithm: 1,
    evenBrackets: 0,
    hardSides: true,
    manualSides: false,
    matchesPerBracket: 1,
    minimizeReMeet: false,
    noClubMatches: false,
    shuffleRooms: false,
    sides: 0,
    manualPairing
  })
}
