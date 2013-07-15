(function() {
  define(['team', 'judge', 'round', 'util', 'alertcontroller'], function(Team, Judge, Round, Util, AlertController) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/rounds/:roundIndex', {
        templateUrl: 'partials/rounds.html',
        controller: [
          '$scope', '$routeParams', '$compile', function($scope, $routeParams, $compile) {
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
            $scope.addAllRooms = function() {
              var room, _i, _len, _ref, _results;
              _ref = $scope.tournament.rooms;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                room = _ref[_i];
                _results.push(room.rounds[round.id].participates = true);
              }
              return _results;
            };
            $scope.removeAllRooms = function() {
              var room, _i, _len, _ref, _results;
              _ref = $scope.tournament.rooms;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                room = _ref[_i];
                _results.push(room.rounds[round.id].participates = false);
              }
              return _results;
            };
            $scope.sortByRank = function() {
              return round.sortByRank(round.teams);
            };
            $scope.shuffleRooms = function() {
              return round.shuffleRooms();
            };
            $scope.pair = function() {
              var prev;
              $scope.pairOpts = {
                algorithm: 0,
                shuffle: false,
                balance: true,
                brackets: 1
              };
              prev = $scope.prevRounds = round.previousRounds();
              $scope.pairAlgorithms = prev.length ? Round.allAlgos : Round.initialAlgos;
              $scope.algoName = Round.algoName;
              $scope.parseInt = function(s) {
                if (s === '') {
                  return 0;
                }
                return parseInt(s);
              };
              $scope.pairingTeams = round.pairingTeams();
              return new AlertController({
                buttons: ['Cancel', 'Ok'],
                cancelButtonIndex: 0,
                title: 'Round ' + (index + 1) + ' pairing',
                htmlMessage: $compile(templates.pairModal())($scope),
                onClick: function(alert, button) {
                  if (button === 1) {
                    alert.modal('hide');
                    return Util.safeApply($scope, function() {
                      return round.pair($scope.pairOpts);
                    });
                  }
                }
              });
            };
            $scope.eliminateNil = function(a) {
              if (a == null) {
                return '';
              }
              return a;
            };
            $scope.namePlaceholder = function(a) {
              if (a == null) {
                return {
                  name: ''
                };
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
