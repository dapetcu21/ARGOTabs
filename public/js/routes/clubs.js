(function() {
  define(['club'], function(Club) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/clubs', {
        templateUrl: 'partials/clubs.html',
        controller: [
          '$scope', function($scope) {
            $scope.ui = ui;
            $scope.addClub = function() {
              var club, tournament;
              tournament = ui.tournament;
              club = new Club(tournament);
              tournament.clubs.push(club);
              return setTimeout(function() {
                return $('#clubs-table').find('.textedit-label').last().click();
              }, 1);
            };
            $scope.noColumns = function(hover) {
              if (hover) {
                return 1;
              } else {
                return 2;
              }
            };
            return $scope.removeClub = function(index) {
              var array, club, team, _i, _len, _ref;
              array = ui.tournament.clubs;
              club = array[index];
              _ref = club.teams;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                team = _ref[_i];
                team.club = null;
              }
              return array.splice(index, 1);
            };
          }
        ]
      });
    };
  });

}).call(this);
