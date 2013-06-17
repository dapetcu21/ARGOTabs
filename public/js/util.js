(function() {
  define(function() {
    var Util;
    return Util = (function() {
      function Util() {}

      Util.unpackCycles = function(a, index) {
        var i, v, _i, _len;
        for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
          v = a[i];
          if (typeof v === 'number') {
            a[i] = index[v];
          }
        }
      };

      Util.unpackCycle = function(a, index) {
        if (typeof a === 'number') {
          try {
            return index[a];
          } catch (_error) {
            return null;
          }
        }
        return null;
      };

      Util.packCycle = function(a, index) {
        return index.indexOf(a);
      };

      Util.packCycles = function(a, index) {
        var r, v, _i, _len;
        r = [];
        for (_i = 0, _len = a.length; _i < _len; _i++) {
          v = a[_i];
          r.push(index.indexOf(v));
        }
        return r;
      };

      Util.getObjectClass = function(obj) {
        var arr;
        if (obj && obj.constructor && obj.constructor.toString) {
          arr = obj.constructor.toString().match(/function\s*(\w+)/);
          if (arr && arr.length === 2) {
            return arr[1];
          }
        }
        return void 0;
      };

      Util.getClass = function(constructor) {
        var arr;
        if (constructor && constructor.toString) {
          arr = constructor.toString().match(/function\s*(\w+)/);
          if (arr && arr.length === 2) {
            return arr[1];
          }
        }
        return void 0;
      };

      Util.copyObject = function(orig, ignores) {
        var key, model, value, _i, _len;
        if (ignores == null) {
          ignores = [];
        }
        ignores.push('$$hashKey');
        model = {};
        for (key in orig) {
          value = orig[key];
          model[key] = value;
        }
        for (_i = 0, _len = ignores.length; _i < _len; _i++) {
          key = ignores[_i];
          model[key] = void 0;
        }
        return model;
      };

      return Util;

    })();
  });

}).call(this);
