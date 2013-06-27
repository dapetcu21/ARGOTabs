(function() {
  define(['util'], function(Util) {
    var Judge;
    return Judge = (function() {
      function Judge(tournament, other) {
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
        if (this.rank == null) {
          this.rank = 0;
        }
      }

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
        if (this.club) {
          return this.club.removeJudge(this);
        }
      };

      return Judge;

    })();
  });

}).call(this);
