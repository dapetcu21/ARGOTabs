const Util = require('../core/util')
const _ = require('lodash')
const UUID = require('./uuid')

class Ballot {
  constructor (round, other) {
    this.round = round

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value
      }
    }

    (this.teams != null ? this.teams : this.teams = [null, null]);
    (this.presence != null ? this.presence : this.presence = [true, true]);
    (this.room != null ? this.room : this.room = null);
    (this.locked != null ? this.locked : this.locked = false);
    (this.id != null ? this.id : this.id = UUID('ballot_'));
    (this.votes != null ? this.votes : this.votes = []);
    (this.judges != null ? this.judges : this.judges = []);
    (this.shadows != null ? this.shadows : this.shadows = []);
    (this.roles != null ? this.roles : this.roles = null)
  }

  getSpeakerRoles () {
    var roles = [{
      roles: []
    }, {
      roles: []
    }]

    if (this.roles) {
      for (var i of [0, 1]) {
        for (var j of [0, 1, 2, 3]) {
          roles[i].roles.push(this.roles[i][j])
        }
      }

      return roles
    }

    var pushRoles = (team, r) => {
      var side
      var v = this.round.previousRounds()

      for (var pr of v) {
        var bal = team.rounds[pr.id]

        if (bal != null) {
          bal = bal.ballot

          if (bal != null) {
            side = 0

            if (bal.teams[1] === team) {
              side = 1
            }

            if (!(bal.roles != null)) {
              continue
            }

            v = bal.roles[side]

            if (!(v != null)) {
              continue
            }

            for (var i of v) {
              r.push(i)
            }

            return
          }
        }
      }

      var n = team.players.length

      if (n) {
        for (var l of [0, 1, 2]) {
          r.push(team.players[l % n])
        }

        r.push(team.players[0])
      } else {
        for (var l of [0, 1, 2, 3]) {
          r.push(null)
        }
      }

      return
    }

    pushRoles(this.teams[0], roles[0].roles)
    pushRoles(this.teams[1], roles[1].roles)
    return roles
  }

  isCompatible (judge) {
    return false

    return (() => {
      return this.round.judgeRules.isCompatible(this, judge)
    })()
  }

  getVotesForBallots (b) {
    var md
    var dv
    var votes

    if (this.votes && this.votes.length) {
      votes = []

      for (var v of this.votes) {
        votes.push(Util.deepCopy(v, ['judge']))
      }

      return votes
    }

    var judges = this.judges
    var n = judges.length
    votes = []
    var tournament = this.round.tournament
    var avgCons = (tournament.minConstructiveScore + tournament.maxConstructiveScore) / 2
    var avgReply = (tournament.minReplyScore + tournament.maxReplyScore) / 2

    var newVote = function (judge, bal = 1) {
      v = {}
      v.judge = judge
      v.ballots = bal
      v.prop = bal
      v.opp = 0

      v.scores = [
        [avgCons, avgCons, avgCons, avgReply],
        [avgCons, avgCons, avgCons, avgReply]
      ]

      return v
    }

    if (n) {
      if (n >= b) {
        for (var i of (function () {
          var results2 = []

          for (var k = 0; (0 <= b ? k < b : k > b); (0 <= b ? k++ : k--)) {
            results2.push(k)
          }

          return results2
        }).apply(this)) {
          votes.push(newVote(judges[i]))
        }
      } else {
        dv = (b / n) | 0
        md = b % n

        for (var i of (function () {
          var results1 = []

          for (var j = 0; (0 <= n ? j < n : j > n); (0 <= n ? j++ : j--)) {
            results1.push(j)
          }

          return results1
        }).apply(this)) {
          votes.push(newVote(judges[i], dv + ((i < md ? 1 : 0))))
        }
      }
    } else {
      for (var i of (function () {
        var results = []

        for (var i = 0; (0 <= b ? i < b : i > b); (0 <= b ? i++ : i--)) {
          results.push(i)
        }

        return results
      }).apply(this)) {
        votes.push(newVote(null))
      }
    }

    return votes
  }

  unpackCycles () {
    this.teams[0] = Util.unpackCycle(this.teams[0], this.round.tournament.teams)
    this.teams[1] = Util.unpackCycle(this.teams[1], this.round.tournament.teams)
    this.room = Util.unpackCycle(this.room, this.round.tournament.rooms)
    Util.unpackCycles(this.judges, this.round.tournament.judges)
    Util.unpackCycles(this.shadows, this.round.tournament.judges)

    if (this.roles != null) {
      for (var i of [0, 1]) {
        if (!(this.teams[i] != null)) {
          continue
        }

        var v = this.roles[i]

        for (var j of (function () {
          var results = []

          for (var i = 0, ref = v.length; (0 <= ref ? i < ref : i > ref); (0 <= ref ? i++ : i--)) {
            results.push(i)
          }

          return results
        }).apply(this)) {
          v[j] = Util.unpackCycle(v[j], this.teams[i].players)
        }
      }
    }

    return (() => {
      for (var vote of this.votes) {
        vote.judge = Util.unpackCycle(vote.judge, this.round.tournament.judges)
      }
    })()
  }

  toJSON () {
    var model = Util.copyObject(this, ['round', 'stats'])

    model.teams = [
      Util.packCycle(this.teams[0], this.round.tournament.teams),
      Util.packCycle(this.teams[1], this.round.tournament.teams)
    ]

    if (this.roles != null) {
      model.roles = [[], []]

      for (var i of [0, 1]) {
        if (!(this.teams[i] != null)) {
          continue
        }

        v = model.roles[i]
        var vv = this.roles[i]

        for (var o of vv) {
          v.push(Util.packCycle(o, this.teams[i].players))
        }
      }
    }

    model.votes = []

    for (var v of this.votes) {
      var vote = Util.copyObject(v)
      vote.judge = Util.packCycle(vote.judge, this.round.tournament.judges)
      model.votes.push(vote)
    }

    model.room = Util.packCycle(this.room, this.round.tournament.rooms)
    model.judges = Util.packCycles(this.judges, this.round.tournament.judges)
    model.shadows = Util.packCycles(this.shadows, this.round.tournament.judges)
    return model
  }

  destroy () {
    if (this.team) {
      return this.team.removePlayer(this)
    }
  }
}

module.exports = Ballot
