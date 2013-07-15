(function() {
  define(['util', 'player'], function(Util, Player) {
    var Team;
    return Team = (function() {
      function Team(tournament, other) {
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
        if (this.players == null) {
          this.players = [];
        }
        if (this.rounds == null) {
          this.rounds = {};
        }
        if (!other) {
          _ref = this.tournament.rounds;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            round = _ref[_i];
            round.registerTeam(this);
          }
        }
      }

      Team.prototype.unpackCycles = function() {
        var id, opts, round, _i, _len, _ref, _results;
        this.club = Util.unpackCycle(this.club, this.tournament.clubs);
        Util.unpackCycles(this.players, this.tournament.players);
        _ref = this.rounds;
        _results = [];
        for (opts = _i = 0, _len = _ref.length; _i < _len; opts = ++_i) {
          id = _ref[opts];
          round = this.tournament.rounds[id];
          if (round && opts.ballot) {
            _results.push(opts.ballot = Util.unpackCycle(opts.ballot, round.ballots));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Team.prototype.toJSON = function() {
        var id, model, opts, round, _i, _len, _ref;
        model = Util.copyObject(this, ['tournament']);
        model.club = Util.packCycle(this.club, this.tournament.clubs);
        model.players = Util.packCycles(this.players, this.tournament.players);
        _ref = this.rounds;
        for (opts = _i = 0, _len = _ref.length; _i < _len; opts = ++_i) {
          id = _ref[opts];
          round = this.tournament.rounds[id];
          if (round && opts.ballot) {
            opts.ballot = Util.packCycle(opts.ballot, round.ballots);
          }
        }
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
        var round, _i, _len, _ref;
        _ref = this.tournament.rounds;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          round = _ref[_i];
          round.unregisterTeam(this);
        }
        if (this.club) {
          return this.club.removeTeam(this);
        }
      };

      return Team;

    })();
  });

}).call(this);
