(function() {
  define(['team'], function(Team) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/teams', {
        templateUrl: 'partials/teams.html',
        controller: [
          '$scope', function($scope) {
            $scope.ui = ui;
            $scope.addTeam = function() {
              var team, tournament;
              tournament = ui.tournament;
              team = new Team(tournament);
              return tournament.teams.push(team);
            };
            $scope.removeTeam = function(index) {
              var array, team;
              array = ui.tournament.teams;
              team = array[index];
              array.splice(index, 1);
              if (team.club) {
                return team.club.removeTeam(team);
              }
            };
            $scope.initRepeat = function(iScope) {
              return iScope.$watch(function() {
                return iScope.o.club;
              }, function(newValue, oldValue) {
                var team;
                if (newValue === oldValue) {
                  return;
                }
                team = iScope.o;
                if (oldValue) {
                  oldValue.removeTeam(team);
                }
                if (newValue) {
                  return newValue.addTeam(team);
                }
              });
            };
            return $scope.eliminateNil = function(a) {
              if (a == null) {
                return '';
              }
              return a;
            };
          }
        ]
      });
    };
  });

}).call(this);
