(function() {
  define(function() {
    var Backend;
    return Backend = (function() {
      function Backend() {
        throw new Error("Backend is purely virtual");
      }

      Backend.prototype.save = function() {
        throw new Error("save(): Not implemented");
      };

      Backend.prototype.load = function() {
        throw new Error("load(): Not implemented");
      };

      return Backend;

    })();
  });

}).call(this);
