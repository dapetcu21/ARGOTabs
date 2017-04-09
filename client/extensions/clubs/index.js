const Club = require('../../models/club')
const templateView = require('./templates/view.jade')

require('./common.styl')

class Clubs {
  sidebarCategory () {
    return 'Participants'
  }

  sidebarItem () {
    return {
      name: 'Clubs',
      sortToken: 1
    }
  }

  route () {
    return '/clubs'
  }

  routeOpts () {
    return {
      template: templateView(),
      controller: ['$scope', $scope => {
        $scope.uncloak = true
        var tournament = $scope.tournament

        $scope.addClub = () => {
          var club = new Club(tournament)
          return tournament.clubs.push(club)
        }

        $scope.removeClub = index => {
          var array = tournament.clubs
          var club = array[index]
          club.destroy()
          return array.splice(index, 1)
        }
      }]
    }
  }
}

module.exports = Clubs
