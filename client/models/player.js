const Util = require('../core/util')
const UUID = require('./uuid')

class Player {
  constructor (tournament, other) {
    this.tournament = tournament

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value
      }
    }

    (this.name != null ? this.name : this.name = 'Unnamed');
    (this.id != null ? this.id : this.id = UUID('player_'))
  }

  unpackCycles () {
    return this.team = Util.unpackCycle(this.team, this.tournament.teams)
  }

  toJSON () {
    var model = Util.copyObject(this, ['tournament', 'stats'])
    model.team = Util.packCycle(this.team, this.tournament.teams)
    return model
  }

  destroy () {
    if (this.team) {
      return this.team.removePlayer(this)
    }
  }

  static calculateStats (players, rounds) {
    return (() => {
      for (var p of players) {
        p.stats = p.getStats(rounds)
      }
    })()
  }

  getStats (rounds) {
    var side

    var o = {
      rawScore: 0,
      rawReply: 0,
      rawHighLow: 0,
      roundsPlayed: 0,
      roundsReplyed: 0,
      scoreCount: 0,
      replyCount: 0,
      byes: 0,
      replyByes: 0,
      minScore: 80,
      maxScore: 0,
      score: 0,
      reply: 0,
      replyBallots: 0,
      scoreHighLow: 0,
      breakdown: []
    }

    for (var roundId of rounds) {
      if (typeof roundId === 'object') {
        roundId = roundId.id
      }

      o.breakdown.push(null)
      var round = this.tournament.roundWithId(roundId)

      if (!(this.team != null)) {
        continue
      }

      var ballot = this.team.rounds[roundId].ballot

      if (!ballot || !ballot.locked || !(ballot.roles != null)) {
        continue
      }

      if (this.team === ballot.teams[0]) {
        side = 0
      } else if (this.team === ballot.teams[1]) {
        side = 1
      } else {
        continue
      }

      var didReply = ballot.roles[side][3] === this
      var didSpeech = false

      for (var i of [0, 1, 2]) {
        if (ballot.roles[side][i] === this) {
          didSpeech = true
          break
        }
      }

      var roundScore = 0
      var roundScoreCount = 0

      if (ballot.presence[side]) {
        if (ballot.presence[1 - side] && ballot.teams[1 - side]) {
          if (didSpeech) {
            o.roundsPlayed++

            for (var speaker of [0, 1, 2]) {
              if (ballot.roles[side][speaker] !== this) {
                continue
              }

              for (var vote of ballot.votes) {
                var score = vote.scores[side][speaker]
                roundScore += score * vote.ballots
                roundScoreCount += vote.ballots
                o.rawScore += score * vote.ballots
                o.scoreCount += vote.ballots

                if (score < o.minScore) {
                  o.minScore = score
                }

                if (score > o.maxScore) {
                  o.maxScore = score
                }
              }
            }
          }

          if (didReply) {
            o.roundsReplyed++

            for (var vote of ballot.votes) {
              score = vote.scores[side][3]
              o.rawReply += score * vote.ballots
              o.replyCount += vote.ballots
            }
          }
        } else {
          if (didSpeech) {
            o.byes += round.ballotsPerMatchSolved()
            o.roundsPlayed++
          }

          if (didReply) {
            o.replyByes += round.ballotsPerMatchSolved()
            o.roundsReplyed++
          }
        }
      }

      if (roundScoreCount) {
        o.breakdown[o.breakdown.length - 1] = (roundScore / roundScoreCount)
      }
    }

    var allScores = o.scoreCount + o.byes
    o.replyBallots = o.replyCount + o.replyByes

    o.score = (() => {
      if (o.scoreCount) {
        return o.rawScore / o.scoreCount
      } else if (o.byes) {
        return -1
      } else {
        return 0
      }
    })()

    o.reply = (() => {
      if (o.replyCount) {
        return o.rawReply / o.replyCount
      } else if (o.replyByes) {
        return -1
      } else {
        return 0
      }
    })()

    o.scoreHighLow = 0

    if (allScores > 2) {
      o.highLowScoreCount = allScores - 2

      if (o.scoreCount) {
        o.rawHighLow = o.rawScore + o.score * o.byes - o.minScore - o.maxScore
        o.scoreHighLow = o.rawHighLow / o.highLowScoreCount
      } else {
        o.rawHighLow = -1
        o.scoreHighLow = -1
      }
    } else {
      o.highLowScoreCount = 0
      o.rawHighLow = 0
      o.scoreHighLow = 0
    }

    return o
  }
}

module.exports = Player
