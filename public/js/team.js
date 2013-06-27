(function() {
  define(['util', 'player'], function(Util, Player) {
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
        if (this.players == null) {
          this.players = [];
        }
      }

      Team.prototype.unpackCycles = function() {
        this.club = Util.unpackCycle(this.club, this.tournament.clubs);
        return Util.unpackCycles(this.players, this.tournament.players);
      };

      Team.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.club = Util.packCycle(this.club, this.tournament.clubs);
        model.players = Util.packCycles(this.players, this.tournament.players);
        return model;
      };

      Team.prototype.addPlayer = function() {
        var pl;
        pl = new Player(this.tournament);
        this.players.push(pl);
        this.tournament.players.push(pl);
        return pl.team = this;
      };

      Team.prototype.removePlayer = function(player) {
        var idx;
        idx = this.players.indexOf(player);
        return this.players.splice(idx, 1);
      };

      Team.prototype.removePlayerAtIndex = function(index) {
        var arr, idx, player;
        player = this.players[index];
        this.players.splice(index, 1);
        arr = this.tournament.players;
        idx = arr.indexOf(player);
        return arr.splice(idx, 1);
      };

      Team.prototype.destroy = function() {
        if (this.club) {
          return this.club.removeTeam(this);
        }
      };

      return Team;

    })();
  });

}).call(this);
