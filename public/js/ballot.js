(function() {
  define(['util'], function(Util) {
    var Ballot;
    return Ballot = (function() {
      function Ballot(round, other) {
        var key, value;
        this.round = round;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.prop == null) {
          this.prop = null;
        }
        if (this.opp == null) {
          this.opp = null;
        }
        if (this.room == null) {
          this.room = null;
        }
      }

      Ballot.prototype.unpackCycles = function() {
        this.prop = Util.unpackCycle(this.prop, this.round.tournament.teams);
        this.opp = Util.unpackCycle(this.opp, this.round.tournament.teams);
        return this.room = Util.unpackCycle(this.room, this.round.tournament.rooms);
      };

      Ballot.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['round']);
        model.prop = Util.packCycle(this.prop, this.round.tournament.teams);
        model.opp = Util.packCycle(this.opp, this.round.tournament.teams);
        model.room = Util.packCycle(this.room, this.round.tournament.rooms);
        return model;
      };

      Ballot.prototype.destroy = function() {
        if (this.team) {
          return this.team.removePlayer(this);
        }
      };

      return Ballot;

    })();
  });

}).call(this);
