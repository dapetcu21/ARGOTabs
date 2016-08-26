const Team = require('../../models/team')
const templateView = require('./templates/view.jade')
const angular = require('angular')

require('./common.styl')

var ngModule = angular.module('teams', [])

ngModule.controller('EditableController', ['$scope', '$element', function ($scope, $element) {
  $scope.editPlayers = false

  $scope.addPlayer = function (team) {
    team.addPlayer()

    return setTimeout(function () {
      return $element.find('.item:last-child .textedit-label').focus()
    }, 0)
  }

  $scope.removePlayer = function (team, index) {
    team.removePlayerAtIndex(index)
    return $scope.editPlayers = !!team.players.length
  }

  return $scope.$watch(function () {
    return $scope.o.club
  }, function (newValue, oldValue) {
    if (newValue === oldValue) {
      return
    }

    var team = $scope.o

    if (oldValue) {
      oldValue.removeTeam(team)
    }

    if (newValue) {
      return newValue.addTeam(team)
    }
  })
}])

class Teams {
  constructor (ui) {
    this.ui = ui
  }

  sidebarCategory () {
    return 'Participants'
  }

  sidebarItem () {
    return {
      name: 'Teams',
      sortToken: 2
    }
  }

  angularModules () {
    return ['teams']
  }

  route () {
    return '/teams'
  }

  routeOpts () {
    var result
    var ui = this.ui

    return result = {
      template: templateView(),

      controller: ['$scope', function ($scope) {
        $scope.addTeam = function () {
          var tournament = ui.tournament
          var team = new Team(tournament)
          return tournament.teams.push(team)
        }

        $scope.removeTeam = function (index) {
          var array = ui.tournament.teams
          array[index].destroy()
          return array.splice(index, 1)
        }

        $scope.canRemoveTeam = function (team) {
          for (var round of ui.tournament.rounds) {
            var ropts = team.rounds[round.id]

            if (ropts != null && ropts.ballot != null) {
              return false
            }
          }

          return true
        }

        $scope.canRemovePlayer = function (player) {
          var team = player.team

          for (var round of ui.tournament.rounds) {
            var ropts = team.rounds[round.id]

            if (ropts != null && ropts.ballot != null && ropts.ballot.locked && ropts.ballot.roles != null) {
              for (var i of [0, 1]) {
                for (var j of [0, 1, 2, 3]) {
                  if (ropts.ballot.roles[i][j] === player) {
                    return false
                  }
                }
              }
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

module.exports = Teams
