const Util = require('../core/util')
const Player = require('./player')
const UUID = require('./uuid')

class Team {
  constructor (tournament, other) {
    this.tournament = tournament

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value
      }
    }

    (this.name != null ? this.name : this.name = '');
    (this.id != null ? this.id : this.id = UUID('team_'));
    (this.players != null ? this.players : this.players = []);
    (this.rounds != null ? this.rounds : this.rounds = {})

    if (!other) {
      for (var round of this.tournament.rounds) {
        round.registerTeam(this)
      }
    }
  }

  unpackCycles () {
    this.club = Util.unpackCycle(this.club, this.tournament.clubs)
    Util.unpackCycles(this.players, this.tournament.players)

    return (() => {
      for (var [id, opts] of Object.entries(this.rounds)) {
        var round = this.tournament.roundWithId(id)

        if (round && opts.ballot != null) {
          opts.ballot = Util.unpackCycle(opts.ballot, round.ballots)
        }
      }
    })()
  }

  toJSON () {
    var mopts
    var model = Util.copyObject(this, ['tournament', 'rounds', 'stats'])
    model.club = Util.packCycle(this.club, this.tournament.clubs)
    model.players = Util.packCycles(this.players, this.tournament.players)
    model.rounds = {}

    for (var [id, opts] of Object.entries(this.rounds)) {
      var round = this.tournament.roundWithId(id)

      if (round) {
        model.rounds[id] = mopts = Util.copyObject(opts)

        if (opts.ballot) {
          mopts.ballot = Util.packCycle(opts.ballot, round.ballots)
        }
      }
    }

    return model
  }

  static calculateStats (teams, rounds) {
    var totalScore = 0
    var totalReply = 0
    var nScore = 0
    var nReply = 0

    for (var team of teams) {
      var s = team.stats = team.getStats(rounds)

      if (s.score >= 0) {
        totalScore += s.score
        nScore++
      }

      if (s.reply >= 0) {
        totalReply += s.reply
        nReply++
      }
    }

    if (nScore) {
      totalScore /= nScore
    } else {
      totalScore = 70 * 3.5
    }

    if (nReply) {
      totalReply /= nReply
    } else {
      totalReply = 35
    }

    return (() => {
      for (var team of teams) {
        s = team.stats

        if (s.score < 0) {
          if (s.score < -2) {
            s.scoreHighLow = totalScore * -(s.score + 2)
          }

          s.score *= -totalScore
        }

        if (s.reply < 0) {
          s.reply *= -totalReply
        }
      }
    })()
  }

  getStats (rounds) {
    var wins
    var ballots
    var replyScore
    var negativeMarginCount
    var positiveMarginCount
    var negativeMargin
    var positiveMargin
    var score
    var side

    var o = {
      rawWins: 0,
      rawScore: 0,
      rawReply: 0,
      rawBallots: 0,
      byeWins: 0,
      byeBallots: 0,
      minScore: 80 * 3.5,
      maxScore: 0,
      wins: 0,
      score: 0,
      reply: 0,
      scoreHighLow: 0,
      ballots: 0,
      roundsPlayed: 0,
      roundsBotched: 0,
      prop: 0,
      opp: 0,
      margin: 0
    }

    for (var roundId of rounds) {
      if (typeof roundId === 'object') {
        roundId = roundId.id
      }

      var round = this.tournament.roundWithId(roundId)
      var ballot = this.rounds[roundId].ballot

      if (!ballot || !ballot.locked) {
        continue
      }

      if (this === ballot.teams[0]) {
        side = 0
      } else if (this === ballot.teams[1]) {
        side = 1
      } else {
        continue
      }

      if (ballot.presence[side]) {
        if (ballot.presence[1 - side] && ballot.teams[1 - side]) {
          o.roundsPlayed++
          score = 0
          positiveMargin = 0
          negativeMargin = 0
          positiveMarginCount = 0
          negativeMarginCount = 0
          replyScore = 0
          ballots = 0
          wins = 0

          for (var vote of ballot.votes) {
            var margin = 0

            for (var i of [0, 1, 2, 3]) {
              score += vote.scores[side][i] * vote.ballots
              margin += vote.scores[side][i] * vote.ballots
              margin -= vote.scores[1 - side][i] * vote.ballots
            }

            replyScore += vote.scores[side][3] * vote.ballots
            ballots += vote.ballots
            wins += (side ? vote.opp : vote.prop)

            if (margin >= 0) {
              positiveMargin += margin
              positiveMarginCount += vote.ballots
            } else {
              negativeMargin -= margin
              negativeMarginCount += vote.ballots
            }
          }

          if (positiveMarginCount) {
            positiveMargin /= positiveMarginCount
          }

          if (negativeMarginCount) {
            negativeMargin /= negativeMarginCount
          }

          if (wins > ballots - wins) {
            o.rawWins++
            o.margin += positiveMargin
          } else {
            o.margin -= negativeMargin
          }

          o.rawBallots += wins

          if (ballots) {
            score /= ballots
            replyScore /= ballots
          }

          o.rawScore += score
          o.rawReply += replyScore

          if (score < o.minScore) {
            o.minScore = score
          }

          if (score > o.maxScore) {
            o.maxScore = score
          }

          if (side) {
            o.opp++
          } else {
            o.prop++
          }
        } else {
          o.byeWins++
          o.byeBallots += round.ballotsPerMatchSolved()
        }
      } else {
        o.roundsBotched++
      }
    }

    var rp = o.roundsPlayed + o.roundsBotched

    o.byeCountsAsWin = o.rawWins >= rp - o.rawWins
    o.wins = o.rawWins + (o.byeCountsAsWin ? o.byeWins : 0)
    o.ballots = o.rawBallots + (o.byeCountsAsWin ? o.byeBallots : 0)

    o.score = o.rawScore + o.byeWins * (() => {
      if (rp) {
        return (o.rawScore / rp)
      } else {
        return -1
      }
    })()

    o.reply = o.rawReply + o.byeWins * (() => {
      if (rp) {
        return (o.rawReply / rp)
      } else {
        return -1
      }
    })()

    if (o.byeWins + rp > 2 && rp) {
      o.scoreHighLow = o.score - o.minScore - o.maxScore
    }
    return o
  }

  addPlayer () {
    var pl = new Player(this.tournament)
    this.players.push(pl)
    this.tournament.players.push(pl)
    pl.team = this
    return pl
  }

  removePlayer (player) {
    var idx = this.players.indexOf(player)
    return this.players.splice(idx, 1)
  }

  removePlayerAtIndex (index) {
    var player = this.players[index]
    this.players.splice(index, 1)
    var arr = this.tournament.players
    var idx = arr.indexOf(player)
    return arr.splice(idx, 1)
  }

  destroy () {
    for (var round of this.tournament.rounds) {
      round.unregisterTeam(this)
    }

    if (this.club) {
      this.club.removeTeam(this)
    }

    return this.tournament.destroyEntityInJudgeRules(this)
  }
}

module.exports = Team
