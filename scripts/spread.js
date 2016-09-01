function spread () {
  let t = window.ARGOTabs.uiController.tournament
  let teams = t.teams
  let rows = teams.map(team => ({ team, scores: [] }))
  let rounds = t.rounds

  const sum = (a, b) => a + b
  const sqr = x => x * x

  function evaluateRound (round) {
    rows.forEach(row => {
      const ballot = row.team.rounds[round.id].ballot
      const votes = ballot.votes[0].scores
      const side = ballot.teams[0] === row.team ? 0 : 1
      const score = votes[side].reduce(sum, 0)
      row.scores.push(score)
    })
  };

  rounds.forEach(evaluateRound)

  rows.forEach(row => {
    const scores = row.scores
    const average = scores.reduce(sum, 0) / scores.length
    const deviation = Math.sqrt(scores.map(sqr).reduce(sum, 0) / scores.length - average * average)
    row.average = average
    row.deviation = deviation
  })

  return rows.map(row => {
    const scores = row.scores.reduce((acc, ret) => acc + ',' + ret, '')
    return row.team.name + scores + ',' + row.average + ',' + row.deviation
  }).join('\n')
}
