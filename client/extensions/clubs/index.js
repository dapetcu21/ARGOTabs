const Club = require('../../models/club');
const templateView = require('./templates/view.jade');

class Clubs {
  constructor(ui) {
    this.ui = ui;
  }

  sidebarCategory() {
    return "Participants";
  }

  sidebarItem() {
    return {
      name: "Clubs",
      sortToken: 1
    };
  }

  route() {
    return "/clubs";
  }

  routeOpts() {
    return {
      template: templateView(),
      controller: ["$scope", $scope => {
        $scope.addClub = () => {
          var tournament = this.ui.tournament;
          var club = new Club(tournament);
          return tournament.clubs.push(club);
        };

        $scope.removeClub = index => {
          var array = this.ui.tournament.clubs;
          var club = array[index];
          club.destroy();
          return array.splice(index, 1);
        };
      }]
    };
  }
}

module.exports = Clubs;
