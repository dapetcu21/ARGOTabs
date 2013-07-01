(function() {
  define(['judge'], function(Judge) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/judges', {
        templateUrl: 'partials/judges.html',
        controller: [
          '$scope', function($scope) {
            $scope.ranks = Judge.ranks;
            $scope.rankStrings = Judge.rankStrings;
            $scope.addJudge = function() {
              var judge, tournament;
              tournament = ui.tournament;
              judge = new Judge(tournament);
              return tournament.judges.push(judge);
            };
            $scope.removeJudge = function(index) {
              var array;
              array = ui.tournament.judges;
              array[index].destroy();
              return array.splice(index, 1);
            };
            $scope.initRepeat = function(iScope) {
              return iScope.$watch(function() {
                return iScope.o.club;
              }, function(newValue, oldValue) {
                var judge;
                if (newValue === oldValue) {
                  return;
                }
                judge = iScope.o;
                if (oldValue) {
                  oldValue.removeJudge(judge);
                }
                if (newValue) {
                  return newValue.addJudge(judge);
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
