(function() {
  define(['team'], function(Team) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/rounds/:roundIndex', {
        templateUrl: 'partials/rounds.html',
        controller: [
          '$scope', '$routeParams', function($scope, $routeParams) {
            var index, round;
            index = $routeParams.roundIndex - 1;
            round = $scope.round = $scope.tournament.rounds[index];
            $scope.ranks = [0, 1, 2];
            $scope.rankString = 'ABC';
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
