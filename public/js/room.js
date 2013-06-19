(function() {
  define(['util'], function(Util) {
    var Room;
    return Room = (function() {
      function Room(tournament, other) {
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
        if (this.floor == null) {
          this.floor = "";
        }
      }

      Room.prototype.unpackCycles = function() {};

      Room.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        return model;
      };

      Room.prototype.destroy = function() {};

      return Room;

    })();
  });

}).call(this);
