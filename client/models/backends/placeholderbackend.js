const Backend = require('../backend_import');
const Source = require('../source');

class PlaceholderSource extends Source {
  load(fn) {
    return fn({
      name: "Placeholder tournament"
    });
  }

  save() {}

  url() {
    return "placeholder://localhost/Placeholder tournament.atab";
  }
}

class PlaceholderBackend extends Backend {
  schemas() {
    return ["placeholder"];
  }

  load(url) {
    return new PlaceholderSource();
  }

  fetch(callback) {}
}

module.exports = PlaceholderBackend;
