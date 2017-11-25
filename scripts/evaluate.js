function evaluate () {
  let t = window.ARGOTabs.tournament
  let judges = t.judges
  let rows = judges.map(judge => ({ judge, rounds: [] }))
  let rounds = t.rounds

  function evaluateRound (round) {
    rows.forEach(row => {
      const stats = row.judge.rounds[round.id]
      let ret = stats.ballot
      ? { teams: stats.ballot.teams.map(team => team.name), status: stats.shadow ? 'shadow' : 'chair' }
      : { teams: ['', ''], status: 'idle' }
      row.rounds.push(ret)
    })
  };

  rounds.forEach(evaluateRound)

  return rows.map(row => {
    let map = {}
    row.rounds.forEach(ret => ret.teams.forEach(team => {
      if (team && !map[team]) { map[team] = 0 }
      if (team) { map[team]++ }
    }))
    return row.rounds.reduce((acc, ret) =>
      acc + ',' + ret.status + ',' + ret.teams.map(team => map[team] ? team + ' (' + map[team] + ')' : team).join(','),
      row.judge.name
    )
  }).join('\n')
}
