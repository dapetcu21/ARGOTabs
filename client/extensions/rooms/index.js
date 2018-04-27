const templateView = require('./templates/view.jade')
const { newRoom, deleteRoom } = require('../../actions/TournamentActions')

require('./common.styl')

class Rooms {
  sidebarCategory () {
    return 'Participants'
  }

  sidebarItem () {
    return {
      name: 'Rooms',
      sortToken: 4
    }
  }

  route () {
    return '/rooms'
  }

  routeOpts () {
    var result

    return result = {
      template: templateView(),

      controller: ['$scope', function ($scope) {
        $scope.uncloak = true
        var tournament = $scope.tournament

        $scope.addRoom = function () {
          $scope.dispatch(newRoom())
        }

        $scope.removeRoom = function (index) {
          $scope.dispatch(deleteRoom(tournament.rooms[index].id))
        }

        return $scope.canRemoveRoom = function (room) {
          for (var round of tournament.rounds) {
            var ropts = room.rounds[round.id]

            if (ropts != null && ropts.ballot != null) {
              return false
            }
          }
          return true
        }
      }]
    }
  }
}

module.exports = Rooms
