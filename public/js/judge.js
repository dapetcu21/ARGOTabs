(function() {
  define(['util'], function(Util) {
    var Judge;
    return Judge = (function() {
      var i, _i;

      function Judge(tournament, other) {
        var key, round, value, _i, _len, _ref;
        this.tournament = tournament;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.name == null) {
          this.name = "";
        }
        if (this.rank == null) {
          this.rank = 0;
        }
        if (this.rounds == null) {
          this.rounds = {};
        }
        if (!other) {
          _ref = this.tournament.rounds;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            round = _ref[_i];
            round.registerJudge(this);
          }
        }
      }

      Judge.rankStrings = ['A', 'B', 'C'];

      for (i = _i = 3; _i <= 31; i = ++_i) {
        Judge.rankStrings.push(null);
      }

      Judge.rankStrings.push('Shd');

      Judge.ranks = [0, 1, 2, 32];

      Judge.shadowRank = 32;

      Judge.prototype.unpackCycles = function() {
        return this.club = Util.unpackCycle(this.club, this.tournament.clubs);
      };

      Judge.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.club = Util.packCycle(this.club, this.tournament.clubs);
        return model;
      };

      Judge.prototype.destroy = function() {
        var round, _j, _len, _ref;
        _ref = this.tournament.rounds;
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          round = _ref[_j];
          round.unregisterJudge(this);
        }
        if (this.club) {
          return this.club.removeJudge(this);
        }
      };

      return Judge;

    })();
  });

}).call(this);
