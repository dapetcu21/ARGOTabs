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
              $scope.manualPairing = [];
              return new AlertController({
                buttons: ['Cancel', 'Ok'],
                cancelButtonIndex: 0,
                title: 'Round ' + (index + 1) + ' pairing',
                htmlMessage: $compile(templates.pairModal())($scope),
                onClick: function(alert, button) {
                  var opts;
                  if (button === 1) {
                    opts = $scope.pairOpts;
                    if (opts.algorithm === 1) {
                      if ($scope.pairingTeams.length) {
                        alert.find('.error-placeholder').html(templates.errorAlert({
                          error: 'You must pair all the teams before continuing'
                        }));
                        return;
                      }
                      opts.manualPairing = $scope.manualPairing;
                    }
                    alert.modal('hide');
                    return Util.safeApply($scope, function() {
                      return round.pair(opts);
                    });
                  }
                }
              });
            };
            $scope.addTeamToManualPairing = function(team, index) {
              var div, p;
              if ($scope.incompletePairing) {
                p = $scope.incompletePairing;
                $scope.incompletePairing = null;
                if (!p.prop) {
                  p.prop = team;
                } else if (!p.opp) {
                  p.opp = team;
                } else {
                  return;
                }
              } else {
                p = $scope.incompletePairing = {
                  prop: team
                };
                $scope.manualPairing.push(p);
                div = $('.manual-pairings .span8');
                console.log(div, div[0].scrollHeight);
                div.animate({
                  scrollTop: div[0].scrollHeight
                }, 500);
              }
              $scope.pairingTeams.splice(index, 1);
              return console.log('plm');
            };
            $scope.removePairFromManualPairing = function(pair, index) {
              if (pair.prop) {
                if (pair.opp) {
                  $scope.pairingTeams.splice(0, 0, pair.prop, pair.opp);
                } else {
                  $scope.pairingTeams.splice(0, 0, pair.prop);
                }
              } else {
                $scope.pairingTeams.splice(0, 0, pair.opp);
              }
              $scope.manualPairing.splice(index, 1);
              if (pair === $scope.incompletePairing) {
                return $scope.incompletePairing = null;
              }
            };
            $scope.reverseSidesInManualPairing = function(pairing) {
              var p;
              p = pairing.prop;
              pairing.prop = pairing.opp;
              return pairing.opp = p;
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
