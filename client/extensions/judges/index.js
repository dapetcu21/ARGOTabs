const Judge = require('../../models/judge')
const templateView = require('./templates/view.jade')

require('./common.styl')

class Judges {
  sidebarCategory () {
    return 'Participants'
  }

  sidebarItem () {
    return {
      name: 'Judges',
      sortToken: 3
    }
  }

  route () {
    return '/judges'
  }

  routeOpts () {
    var result

    return result = {
      template: templateView(),

      controller: ['$scope', function ($scope) {
        $scope.uncloak = true
        var tournament = $scope.tournament

        $scope.ranks = Judge.ranks
        $scope.rankStrings = Judge.rankStrings

        $scope.addJudge = function () {
          var judge = new Judge(tournament)
          return tournament.judges.push(judge)
        }

        $scope.removeJudge = function (index) {
          var array = tournament.judges
          array[index].destroy()
          return array.splice(index, 1)
        }

        $scope.initRepeat = function (iScope) {
          return iScope.$watch(function () {
            return iScope.o.club
          }, function (newValue, oldValue) {
            if (newValue === oldValue) {
              return
            }

            var judge = iScope.o

            if (oldValue) {
              oldValue.removeJudge(judge)
            }

            if (newValue) {
              return newValue.addJudge(judge)
            }
          })
        }

        $scope.canRemoveJudge = function (judge) {
          for (var round of tournament.rounds) {
            var ropts = judge.rounds[round.id]

            if (ropts != null && ropts.ballot != null && ropts.ballot.locked) {
              return false
            }
          }

          return true
        }

        return $scope.eliminateNil = function (a) {
          if (!(typeof a !== 'undefined' && a !== null)) {
            return ''
          }

          return a
        }
      }]
    }
  }
}

module.exports = Judges
