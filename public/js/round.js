(function() {
  define(['util', 'underscore'], function(Util, _) {
    var Round;
    return Round = (function() {
      function Round(tournament, other) {
        var judge, key, team, value, _i, _j, _len, _len1, _ref, _ref1;
        this.tournament = tournament;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.id == null) {
          this.id = Math.floor(Math.random() * 100000000);
        }
        if (this.tableOpts == null) {
          this.tableOpts = {};
        }
        if (this.judges == null) {
          this.judges = [];
        }
        if (this.teams == null) {
          this.teams = [];
        }
        if (!other) {
          _ref = this.tournament.teams;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            team = _ref[_i];
            this.registerTeam(team);
          }
          _ref1 = this.tournament.judges;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            judge = _ref1[_j];
            this.registerJudge(judge);
          }
        }
      }

      Round.prototype.unpackCycles = function() {
        Util.unpackCycles(this.teams, this.tournament.teams);
        return Util.unpackCycles(this.judges, this.tournament.judges);
      };

      Round.prototype.registerJudge = function(judge) {
        var id;
        id = this.id;
        if (judge.rounds[id] == null) {
          judge.rounds[id] = {
            participates: true,
            locked: false
          };
          return this.judges.push(judge);
        }
      };

      Round.prototype.unregisterJudge = function(judge) {
        var idx;
        idx = this.judges.indexOf(judge);
        if (idx !== -1) {
          return this.judges.splice(idx, 1);
        }
      };

      Round.prototype.registerTeam = function(team) {
        var id;
        id = this.id;
        if (team.rounds[id] == null) {
          team.rounds[id] = {
            participates: true,
            locked: false
          };
          return this.teams.push(team);
        }
      };

      Round.prototype.unregisterTeam = function(team) {
        var idx;
        idx = this.teams.indexOf(team);
        if (idx !== -1) {
          return this.teams.splice(idx, 1);
        }
      };

      Round.prototype.sortByRank = function(array) {
        return console.log("sorting by rank: ", array);
      };

      Round.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.teams = Util.packCycles(this.teams, this.tournament.teams);
        model.judges = Util.packCycles(this.judges, this.tournament.judges);
        return model;
      };

      Round.prototype.destroy = function() {
        var id, judge, team, _i, _j, _len, _len1, _ref, _ref1, _results;
        id = this.id;
        _ref = this.tournament.teams;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          team = _ref[_i];
          delete team.rounds[id];
        }
        _ref1 = this.tournament.judges;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          judge = _ref1[_j];
          _results.push(delete judge.rounds[id]);
        }
        return _results;
      };

      return Round;

    })();
  });

}).call(this);
