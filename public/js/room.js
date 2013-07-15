(function() {
  define(['util'], function(Util) {
    var Room;
    return Room = (function() {
      function Room(tournament, other) {
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
        if (this.floor == null) {
          this.floor = "";
        }
        if (this.rounds == null) {
          this.rounds = {};
        }
        if (!other) {
          _ref = this.tournament.rounds;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            round = _ref[_i];
            round.registerRounds(this);
          }
        }
      }

      Room.prototype.unpackCycles = function() {};

      Room.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        return model;
      };

      Room.prototype.destroy = function() {
        var round, _i, _len, _ref, _results;
        _ref = this.tournament.rounds;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          round = _ref[_i];
          _results.push(round.unregisterRoom(this));
        }
        return _results;
      };

      return Room;

    })();
  });

}).call(this);
