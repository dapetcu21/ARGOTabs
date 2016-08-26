const Team = require('../../models/team')
const Util = require('../../core/util')
const _ = require('lodash')
const templateView = require('./templates/view.jade')

require('./common.styl')

class TeamRank {
  constructor (ui) {
    this.ui = ui
  }

  sidebarCategory () {
    return 'Statistics'
  }

  sidebarItem () {
    return {
      name: 'Team rank',
      sortToken: 1
    }
  }

  route () {
    return '/team-rank'
  }

  routeOpts () {
    var result
    var ui = this.ui

    return result = {
      template: templateView(),

      controller: ['$scope', function ($scope) {
        var baseRoundIds = function () {
          var tournament = ui.tournament
          var rf = tournament.rankFromTeams
          var objs = {}

          if (rf.all) {
            for (var round of tournament.rounds) {
              if (round.paired) {
                objs[round.id] = true
              }
            }
          } else {
            for (var round of tournament.rounds) {
              if (round.paired && rf[round.id]) {
                objs[round.id] = true
              }
            }
          }

          return objs
        }

        var baseRounds = function (ids) {
          var r = [];
          (ids != null ? ids : ids = baseRoundIds())

          for (var round of ui.tournament.rounds) {
            if (ids[round.id]) {
              r.push(round)
            }
          }

          return r
        }

        $scope.refreshStats = function (rounds) {
          var tournament = ui.tournament
          var teams = $scope.teams = tournament.teams.slice(0);
          (rounds != null ? rounds : rounds = baseRounds())
          Team.calculateStats(teams, rounds)
          var sorter = tournament.teamRankSorter.boundComparator()

          teams.sort(function (a, b) {
            return sorter(a.stats, b.stats)
          })

          var maxScoreDec = 0
          var maxReplyDec = 0
          var maxHighLowDec = 0
          var maxMarginDec = 0

          for (var team of teams) {
            var scoreDec = Util.decimalsOf(team.stats.score, 2)
            var replyDec = Util.decimalsOf(team.stats.reply, 2)
            var highLowDec = Util.decimalsOf(team.stats.scoreHighLow, 2)
            var marginDec = Util.decimalsOf(team.stats.margin, 2)

            if (scoreDec > maxScoreDec) {
              maxScoreDec = scoreDec
            }

            if (replyDec > maxReplyDec) {
              maxReplyDec = replyDec
            }

            if (highLowDec > maxHighLowDec) {
              maxHighLowDec = highLowDec
            }

            if (marginDec > maxMarginDec) {
              maxMarginDec = marginDec
            }
          }

          $scope.scoreDec = maxScoreDec
          $scope.replyDec = maxReplyDec
          $scope.highLowDec = maxHighLowDec
          return $scope.marginDec = maxMarginDec
        }

        var roundIds = null
        Util.installScopeUtils($scope)

        return $scope.$watch((function () {
          return JSON.stringify(roundIds = baseRoundIds())
        }), function (v) {
          return $scope.refreshStats(baseRounds(roundIds))
        })
      }]
    }
  }
}

module.exports = TeamRank
