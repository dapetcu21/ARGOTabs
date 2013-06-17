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
              tournament.teams.push(team);
              return setTimeout(function() {
                return $('#teams-table tr:nth-last-child(2) td:nth-child(2)').click();
              }, 1);
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
            $scope.noColumns = function(hover) {
              if (hover) {
                return 2;
              } else {
                return 3;
              }
            };
            $scope.initRepeat = function(iScope) {
              return iScope.$watch(function() {
                return iScope.team.club;
              }, function(newValue, oldValue) {
                var team;
                if (newValue === oldValue) {
                  return;
                }
                team = iScope.team;
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
