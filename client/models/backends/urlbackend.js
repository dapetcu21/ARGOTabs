const Backend = require('../backend_import');
const Source = require('../source');

class URLSource extends Source {
  load(fn, fnErr = function() {}) {
    var xhr = $.ajax({
      url: this.url().replace("http://argotabdbro.herokuapp.com", "https://argotabdbro.herokuapp.com"),
      dataType: "text"
    });

    xhr.done(function(data) {
      return fn(data);
    });

    return xhr.fail(fnErr);
  }

  save() {
    return;
  }

  canSave() {
    return false;
  }
}

class URLBackend extends Backend {
  schemas() {
    return ["http", "https", "file"];
  }

  load(url) {
    return new URLSource(this, url);
  }

  fetch(fn) {
    return;
  }
}

module.exports = URLBackend;
