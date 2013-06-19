(function() {
  define(['club'], function(Club) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/clubs', {
        templateUrl: 'partials/clubs.html',
        controller: [
          '$scope', function($scope) {
            $scope.addClub = function() {
              var club, tournament;
              console.log('addClub');
              tournament = ui.tournament;
              club = new Club(tournament);
              return tournament.clubs.push(club);
            };
            $scope.removeClub = function(index) {
              var array, club;
              console.log('removeClub(', index, ')');
              array = ui.tournament.clubs;
              club = array[index];
              club.destroy();
              return array.splice(index, 1);
            };
          }
        ]
      });
    };
  });

}).call(this);
