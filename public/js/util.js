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

      Util.safeApply = function(scope, fn) {
        if (scope.$$phase || scope.$root.$$phase) {
          fn();
        } else {
          scope.$apply(fn);
        }
      };

      Util.focusableElement = function(element, first) {
        var el, minIndex, minItem, traverse, _i, _len;
        if (first == null) {
          first = true;
        }
        minItem = null;
        minIndex = first ? 1000001 : 0;
        traverse = function(index, el) {
          var focusable, tabIndex;
          if ($(el).css('display') === 'none' || $(el).css('visibility') === 'hidden') {
            return;
          }
          tabIndex = parseInt(el.getAttribute('tabindex'));
          if (isNaN(tabIndex)) {
            focusable = _.contains(['INPUT', 'TEXTAREA', 'OBJECT', 'BUTTON'], el.tagName);
            focusable = focusable || (_.contains(['A', 'AREA'], el.tagName) && el[0].getAttribute('href'));
            tabIndex = focusable ? 0 : -1;
          }
          if (first && tabIndex <= 0) {
            tabIndex = 1000000 - tabIndex;
          }
          if ((first ? tabIndex < minIndex : tabIndex >= minIndex)) {
            minIndex = tabIndex;
            minItem = el;
          }
          return $(el).children().each(traverse);
        };
        for (_i = 0, _len = element.length; _i < _len; _i++) {
          el = element[_i];
          traverse(0, el);
        }
        return minItem;
      };

      return Util;

    })();
  });

}).call(this);
