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

export function newElimRound (tournament, { uneligibleTeams, breakingSlots }) {
  let teams

  if (!tournament.elimRounds.length) {
    teams = tournament.teams.slice(0)
    Team.calculateStats(teams, tournament.rounds)

    const sorter = tournament.teamRankSorter.boundComparator()
    teams.sort((a, b) => sorter(a.stats, b.stats))

    teams = teams.filter(team => !uneligibleTeams.has(team.id))
    teams = teams.slice(0, breakingSlots)
  } else {
    console.log('idk')
    teams = []
  }

  const slots = breakingSlots / Math.pow(2, tournament.elimRounds.length)

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
