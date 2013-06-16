(function() {
  define(['club'], function(Club) {
    var Tournament;
    return Tournament = (function() {
      function Tournament(backend) {
        this.backend = backend;
        this.clubs = [];
      }

      Tournament.prototype.load = function(fn) {
        var _this = this;
        return this.backend.load(function(loadedString) {
          var club, key, model, newClub, value, _i, _len, _ref;
          try {
            model = JSON.parse(loadedString);
          } catch (_error) {

          }
          if (model == null) {
            model = {};
          }
          _this.clubs = [];
          for (key in model) {
            value = model[key];
            _this[key] = value;
          }
          _ref = _this.clubs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            club = _ref[_i];
            newClub = new Club(_this, club);
          }
          fn();
        });
      };

      Tournament.prototype.toFile = function() {
        var key, model, privates, value, _i, _len;
        model = {};
        for (key in this) {
          value = this[key];
          model[key] = value;
        }
        privates = ['backend'];
        for (_i = 0, _len = privates.length; _i < _len; _i++) {
          key = privates[_i];
          model[key] = void 0;
        }
        return JSON.stringify(model);
      };

      Tournament.prototype.save = function(fn, force) {
        if (force == null) {
          force = false;
        }
        return this.backend.save(this.toFile(), fn, force);
      };

      return Tournament;

    })();
  });

}).call(this);
