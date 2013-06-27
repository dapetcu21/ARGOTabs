(function() {
  define(['util'], function(Util) {
    var Player;
    return Player = (function() {
      function Player(tournament, other) {
        var key, value;
        this.tournament = tournament;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.name == null) {
          this.name = "Unnamed";
        }
      }

      Player.prototype.unpackCycles = function() {
        return this.team = Util.unpackCycle(this.team, this.tournament.teams);
      };

      Player.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.team = Util.packCycle(this.team, this.tournament.teams);
        return model;
      };

      Player.prototype.destroy = function() {
        if (this.team) {
          return this.team.removePlayer(this);
        }
      };

      return Player;

    })();
  });

}).call(this);
