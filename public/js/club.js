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
      }

      Club.prototype.unpackCycles = function() {
        return Util.unpackCycles(this.teams, this.tournament.teams);
      };

      Club.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.teams = Util.packCycles(this.teams, this.tournament.teams);
        return model;
      };

      Club.prototype.removeTeam = function(team) {
        return this.teams.splice(this.teams.indexOf(team, 1));
      };

      Club.prototype.addTeam = function(team) {
        return this.teams.push(team);
      };

      return Club;

    })();
  });

}).call(this);
