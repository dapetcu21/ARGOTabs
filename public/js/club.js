(function() {
  define(function() {
    var Club;
    return Club = (function() {
      function Club(tournament, other) {
        var key, value, _i, _len;
        this.tournament = tournament;
        if (other) {
          for (value = _i = 0, _len = other.length; _i < _len; value = ++_i) {
            key = other[value];
            this[key] = value;
          }
        }
        if (this.name == null) {
          this.name = "";
        }
      }

      Club.prototype.toJSON = function() {
        var key, model, privates, value, _i, _len;
        model = {};
        for (key in this) {
          value = this[key];
          model[key] = value;
        }
        privates = ['tournament'];
        for (_i = 0, _len = privates.length; _i < _len; _i++) {
          key = privates[_i];
          model[key] = void 0;
        }
        return model;
      };

      return Club;

    })();
  });

}).call(this);
