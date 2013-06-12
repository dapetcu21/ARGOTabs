(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backend'], function(Backend) {
    var LocalBackend;
    return LocalBackend = (function(_super) {
      __extends(LocalBackend, _super);

      function LocalBackend(fileName) {
        this.fileName = fileName;
        this.loadDate = new Date();
        this.date = this.modifiedDate();
      }

      LocalBackend.prototype.modifiedDate = function() {
        var date;
        date = localStorage.getItem(this.fileName + '.mdate');
        if (date != null) {
          return new Date(parseInt(date.match(/\d+/)[0]));
        } else {
          return this.loadDate;
        }
      };

      LocalBackend.prototype.load = function(fn) {
        var obj;
        obj = localStorage.getItem(this.fileName + ".atab");
        if (obj == null) {
          obj = "";
        }
        this.loadDate = new Date();
        this.date = this.modifiedDate();
        fn(obj);
      };

      LocalBackend.prototype.save = function(obj, fn, force) {
        if (force == null) {
          force = false;
        }
        if (!force && this.modifiedDate().getTime() > this.date.getTime()) {
          throw new Error("This tournament was modified by an external program since we opened it. Make sure that you don't open the same tournament in another ARGO Tabs window");
        }
        localStorage.setItem(this.fileName + '.atab', obj);
        localStorage.setItem(this.fileName + '.mdate', new Date().getTime());
        fn();
      };

      LocalBackend.listFiles = function(fn) {
        var i, result, v, _i, _ref;
        result = [];
        for (i = _i = 0, _ref = localStorage.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          v = localStorage.key(i).match(/^(.*)\.atab$/);
          if (v && v[1]) {
            result.push(v[1]);
          }
        }
        fn(result);
      };

      return LocalBackend;

    })(Backend);
  });

}).call(this);
