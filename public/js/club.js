(function() {
  define(['util'], function(Util) {
    var Club;
    return Club = (function() {
      function Club(tournament, other) {
        var key, value;
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
        if (this.teams == null) {
          this.teams = [];
        }
        if (this.judges == null) {
          this.judges = [];
        }
      }

      Club.prototype.unpackCycles = function() {
        Util.unpackCycles(this.teams, this.tournament.teams);
        return Util.unpackCycles(this.judges, this.tournament.judges);
      };

      Club.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.teams = Util.packCycles(this.teams, this.tournament.teams);
        model.judges = Util.packCycles(this.judges, this.tournament.judges);
        return model;
      };

      Club.prototype.removeTeam = function(team) {
        var index;
        index = this.teams.indexOf(team);
        if (index !== -1) {
          return this.teams.splice(index, 1);
        }
      };

      Club.prototype.addTeam = function(team) {
        return this.teams.push(team);
      };

      Club.prototype.removeJudge = function(judge) {
        var index;
        index = this.judges.indexOf(judge);
        if (index !== -1) {
          return this.judges.splice(index, 1);
        }
      };

      Club.prototype.addJudge = function(judge) {
        return this.judges.push(judge);
      };

      Club.prototype.destroy = function() {
        var judge, team, _i, _j, _len, _len1, _ref, _ref1, _results;
        _ref = this.teams;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          team = _ref[_i];
          team.club = null;
        }
        _ref1 = this.judges;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          judge = _ref1[_j];
          _results.push(judge.club = null);
        }
        return _results;
      };

      return Club;

    })();
  });

}).call(this);
