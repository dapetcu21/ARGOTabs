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
              }, 0);
            };
            $scope.noColumns = function(hover) {
              if (hover) {
                return 1;
              } else {
                return 2;
              }
            };
            return $scope.removeClub = function(index) {
              return ui.tournament.clubs.splice(index, 1);
            };
          }
        ]
      });
    };
  });

}).call(this);
