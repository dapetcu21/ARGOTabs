(function() {
  define(['club', 'team', 'util'], function(Club, Team, Util) {
    var Tournament;
    return Tournament = (function() {
      function Tournament(backend) {
        this.backend = backend;
        this.clubs = [];
      }

      Tournament.prototype.load = function(fn) {
        var _this = this;
        return this.backend.load(function(loadedString) {
          var club, i, key, model, team, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
          try {
            model = JSON.parse(loadedString);
          } catch (_error) {

          }
          if (model == null) {
            model = {};
          }
          _this.clubs = [];
          _this.teams = [];
          for (key in model) {
            value = model[key];
            _this[key] = value;
          }
          _ref = _this.clubs;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            club = _ref[i];
            _this.clubs[i] = new Club(_this, club);
          }
          _ref1 = _this.teams;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            team = _ref1[i];
            _this.teams[i] = new Team(_this, team);
          }
          _ref2 = _this.clubs;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            club = _ref2[_k];
            club.unpackCycles();
          }
          _ref3 = _this.teams;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            team = _ref3[_l];
            team.unpackCycles();
          }
          _this.lastData = _this.toFile();
          fn();
        });
      };

      Tournament.prototype.toJSON = function() {
        return Util.copyObject(this, ['backend', 'lastData']);
      };

      Tournament.prototype.toFile = function() {
        return JSON.stringify(this);
      };

      Tournament.prototype.save = function(fn, force) {
        if (force == null) {
          force = false;
        }
        return this.saveData(this.toFile(), fn, force);
      };

      Tournament.prototype.saveIfRequired = function(fn, force) {
        var data;
        if (force == null) {
          force = false;
        }
        data = this.toFile();
        if (this.lastData === data) {
          return false;
        }
        this.saveData(data, fn, force);
        return true;
      };

      Tournament.prototype.saveData = function(data, fn, force) {
        var _this = this;
        if (force == null) {
          force = false;
        }
        return this.backend.save(data, function() {
          _this.lastData = data;
          return fn();
        }, force);
      };

      return Tournament;

    })();
  });

}).call(this);
