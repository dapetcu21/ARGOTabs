(function() {
  define(['util'], function(Util) {
    var Team;
    return Team = (function() {
      function Team(tournament, other) {
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
      }

      Team.prototype.unpackCycles = function() {
        return this.club = Util.unpackCycle(this.club, this.tournament.clubs);
      };

      Team.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.club = Util.packCycle(this.club, this.tournament.clubs);
        return model;
      };

      return Team;

    })();
  });

}).call(this);
