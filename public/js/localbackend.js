(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backend'], function(Backend) {
    var LocalBackend;
    return LocalBackend = (function(_super) {
      __extends(LocalBackend, _super);

      function LocalBackend(fName) {
        this.fName = fName;
        this.loadDate = new Date();
        this.date = this.modifiedDate();
      }

      LocalBackend.prototype.modifiedDate = function() {
        var date;
        date = localStorage.getItem(this.fName + '.mdate');
        if (date != null) {
          return new Date(parseInt(date.match(/\d+/)[0]));
        } else {
          return this.loadDate;
        }
      };

      LocalBackend.prototype.load = function(fn) {
        var obj;
        obj = localStorage.getItem(this.fName + ".atab");
        if (obj == null) {
          obj = "";
        }
        this.loadDate = new Date();
        fn(obj);
      };

      LocalBackend.prototype.save = function(obj, fn, force) {
        var e;
        if (force == null) {
          force = false;
        }
        if (!force && this.modifiedDate().getTime() > this.loadDate.getTime()) {
          e = new Error("This tournament was modified by an external program since we opened it. Make sure it's not open in another ARGO Tabs window");
          e.canForce = "Save anyway";
          throw e;
        }
        this.loadDate = new Date();
        localStorage.setItem(this.fName + '.atab', obj);
        localStorage.setItem(this.fName + '.mdate', new Date().getTime());
        fn();
      };

      LocalBackend.prototype["delete"] = function() {
        localStorage.removeItem(this.fName + '.atab');
        return localStorage.removeItem(this.fName + '.mdate');
      };

      LocalBackend.prototype.rename = function(newName) {
        var _this = this;
        return this.load(function(obj) {
          _this["delete"]();
          _this.fName = newName;
          return _this.save(obj, (function() {}), true);
        });
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

      LocalBackend.prototype.fileName = function() {
        return this.fName;
      };

      return LocalBackend;

    })(Backend);
  });

}).call(this);
