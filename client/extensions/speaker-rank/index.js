const Player = require('../../models/player');
const Util = require('../../core/util');
const _ = require('lodash');
const templateView = require('./templates/view.jade');

require('./common.styl');

class SpeakerRank {
  constructor(ui) {
    this.ui = ui;
  }

  sidebarCategory() {
    return "Statistics";
  }

  sidebarItem() {
    return {
      name: "Speaker rank",
      sortToken: 2
    };
  }

  route() {
    return "/speaker-rank";
  }

  routeOpts() {
    var result;
    var ui = this.ui;

    return result = {
      template: templateView(),

      controller: ["$scope", function($scope) {
        var baseRoundIds = function() {
          var tournament = ui.tournament;
          var rf = tournament.rankFromSpeakers;
          var objs = {};

          if (rf.all) {
            for (var round of tournament.rounds) {
              if (round.paired) {
                objs[round.id] = true;
              }
            }
          } else {
            for (var round of tournament.rounds) {
              if (round.paired && rf[round.id]) {
                objs[round.id] = true;
              }
            }
          }

          return objs;
        };

        var baseRounds = function(ids) {
          var r = [];
          (ids != null ? ids : ids = baseRoundIds());

          for (var round of ui.tournament.rounds) {
            if (ids[round.id]) {
              r.push(round);
            }
          }

          return r;
        };

        $scope.formatBreakdown = function(breakdown) {
          breakdown = _.map(breakdown, function(score) {
            if (!(typeof score !== "undefined" && score !== null)) {
              return "-";
            } else {
              return score.toFixed(Util.decimalsOf(score, 2));
            }
          });

          return breakdown.join(" ");
        };

        $scope.refreshDecimals = function() {
          var players = $scope.players;

          if (!(players != null)) {
            return;
          }

          var maxScoreDec = 0;
          var maxReplyDec = 0;
          var maxHighLowDec = 0;
          var showTotals = ui.tournament.speakerRankShowTotals;

          for (var player of players) {
            var scoreDec = Util.decimalsOf(((showTotals ? player.stats.rawScore : player.stats.score)), 2);
            var highLowDec = Util.decimalsOf(((showTotals ? player.stats.rawHighLow : player.stats.scoreHighLow)), 2);
            var replyDec = Util.decimalsOf(player.stats.reply, 2);

            if (scoreDec > maxScoreDec) {
              maxScoreDec = scoreDec;
            }

            if (replyDec > maxReplyDec) {
              maxReplyDec = replyDec;
            }

            if (highLowDec > maxHighLowDec) {
              maxHighLowDec = highLowDec;
            }
          }

          $scope.scoreDec = maxScoreDec;
          $scope.replyDec = maxReplyDec;
          return $scope.highLowDec = maxHighLowDec;
        };

        $scope.refreshStats = function(rounds) {
          var tournament = ui.tournament;
          var players = $scope.players = tournament.players.slice(0);
          (rounds != null ? rounds : rounds = baseRounds());
          Player.calculateStats(players, rounds);
          var sorter = tournament.speakerRankSorter.boundComparator();

          players.sort(function(a, b) {
            var aout = a.stats.roundsPlayed < tournament.minPlayed;
            var ain = b.stats.roundsPlayed < tournament.minPlayed;

            if (ain === aout) {
              return sorter(a.stats, b.stats);
            }

            if (ain) {
              return -1;
            }

            return 1;
          });

          return $scope.refreshDecimals();
        };

        var roundIds = null;
        Util.installScopeUtils($scope);

        $scope.$watch((function() {
          return ui.tournament.speakerRankShowTotals;
        }), function(v) {
          return $scope.refreshDecimals();
        });

        return $scope.$watch((function() {
          return JSON.stringify(roundIds = baseRoundIds());
        }), function(v) {
          return $scope.refreshStats(baseRounds(roundIds));
        });
      }]
    };
  }
}

module.exports = SpeakerRank;
