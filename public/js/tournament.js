(function() {
  define(function() {
    var Tournament;
    return Tournament = (function() {
      function Tournament(backend) {
        this.backend = backend;
      }

      Tournament.prototype.load = function(fn) {
        var _this = this;
        return this.backend.load(function(loadedString) {
          var model;
          try {
            model = JSON.parse(loadedString);
          } catch (_error) {

          }
          if (model == null) {
            model = {};
          }
          _this.name = model.name;
          if (_this.name == null) {
            _this.name = "No namer";
          }
          fn();
        });
      };

      Tournament.prototype.toFile = function() {
        var model;
        model = {
          name: this.name
        };
        return JSON.stringify(model);
      };

      Tournament.prototype.save = function(fn) {
        var model;
        model = {
          name: this.name
        };
        return this.backend.save(this.toFile(), fn);
      };

      return Tournament;

    })();
  });

}).call(this);
