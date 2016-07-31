const Backend = require('../backend_import');
const Source = require('../source');

class LocalSource extends Source {
  constructor() {
    super(...arguments);
    this.loadDate = new Date();
    this.date = this.modifiedDate();
    this.fName = this.fileName();
  }

  exists() {
    return localStorage.hasOwnProperty(this.fName + ".atab");
  }

  modifiedDate() {
    var date = localStorage.getItem(this.fName + ".mdate");

    if (date != null) {
      return new Date(parseInt(date.match(/\d+/)[0]));
    } else {
      return this.loadDate;
    }
  }

  load(fn, fnErr = function() {}) {
    try {
      var obj = localStorage.getItem(this.fName + ".atab");
      (obj != null ? obj : obj = "");
      this.loadDate = new Date();
      fn(obj);
    } catch (err) {
      fnErr(err);
    }

    return;
  }

  save(obj, fn, force = false) {
    var e;

    if (!force && this.modifiedDate().getTime() > this.loadDate.getTime()) {
      e = new Error(
        "This tournament was modified by an external program since we opened it. Make sure it's not open in another ARGO Tabs window"
      );

      e.canForce = "Save anyway";
      throw e;
    }

    this.loadDate = new Date();
    localStorage.setItem(this.fName + ".atab", obj);
    localStorage.setItem(this.fName + ".mdate", this.loadDate.getTime());
    fn();
    return;
  }

  delete() {
    localStorage.removeItem(this.fName + ".atab");
    return localStorage.removeItem(this.fName + ".mdate");
  }

  canRename(newName) {
    return !localStorage.hasOwnProperty(newName + ".atab");
  }

  rename(newName) {
    return this.load(obj => {
      this.delete();
      this._url = this.backend.urlFromFileName(newName);
      this.fName = newName;
      return this.save(obj, (function() {}), true);
    });
  }
}

class LocalBackend extends Backend {
  icon() {
    return "<i class=\"fa fa-fw fa-file\"></i>";
  }

  schemas() {
    return ["local"];
  }

  list(fn) {
    var result = [];

    for (var i of (function() {
        var results = [];

        for (var i = 0, ref = localStorage.length; (0 <= ref ? i < ref : i > ref); (0 <= ref ? i++ : i--)) {
            results.push(i);
        }

        return results;
    }).apply(this)) {
      var v = localStorage.key(i).match(/^(.*)\.atab$/);

      if ((v && v[1])) {
        fn(this.load(this.urlFromFileName(v[1])));
      }
    }

    return;
  }

  load(url) {
    return new LocalSource(this, url);
  }

  urlFromFileName(fname) {
    return "local://localhost/" + encodeURIComponent(fname + ".atab");
  }
}

module.exports = LocalBackend;
