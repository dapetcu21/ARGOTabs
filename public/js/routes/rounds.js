(function() {
  define(['team', 'judge'], function(Team, Judge) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/rounds/:roundIndex', {
        templateUrl: 'partials/rounds.html',
        controller: [
          '$scope', '$routeParams', function($scope, $routeParams) {
            var index, round;
            index = $routeParams.roundIndex - 1;
            round = $scope.round = $scope.tournament.rounds[index];
            $scope.ranks = Judge.ranks;
            $scope.rankStrings = Judge.rankStrings;
            $scope.addAllTeams = function() {
              var team, _i, _len, _ref, _results;
              _ref = $scope.tournament.teams;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                team = _ref[_i];
                _results.push(team.rounds[round.id].participates = true);
              }
              return _results;
            };
            $scope.removeAllTeams = function() {
              var team, _i, _len, _ref, _results;
              _ref = $scope.tournament.teams;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                team = _ref[_i];
                _results.push(team.rounds[round.id].participates = false);
              }
              return _results;
            };
            $scope.addAllJudges = function() {
              var judge, _i, _len, _ref, _results;
              _ref = $scope.tournament.judges;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                judge = _ref[_i];
                _results.push(judge.rounds[round.id].participates = true);
              }
              return _results;
            };
            $scope.removeAllJudges = function() {
              var judge, _i, _len, _ref, _results;
              _ref = $scope.tournament.judges;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                judge = _ref[_i];
                _results.push(judge.rounds[round.id].participates = false);
              }
              return _results;
            };
            $scope.removeShadows = function() {
              var judge, _i, _len, _ref, _results;
              _ref = $scope.tournament.judges;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                judge = _ref[_i];
                if (judge.rank === Judge.shadowRank) {
                  _results.push(judge.rounds[round.id].participates = false);
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            };
            $scope.sortByRank = function() {
              return round.sortByRank(round.teams);
            };
            $scope.pair = function() {
              return console.log("pair");
            };
            $scope.eliminateNil = function(a) {
              if (a == null) {
                return '';
              }
              return a;
            };
            return $scope.nilPlaceholder = function(a, p) {
              if (a == null) {
                return p;
              }
              return a;
            };
          }
        ]
      });
    };
  });

}).call(this);
