const _ = require("lodash");

class Backend {
  list() {}

  load() {
    throw new Error("load(): Not implemented");
  }

  static list(callback) {
    _.each(Backend.backends, backend => {
      backend.list(callback);
    });
  }

  static load(url) {
    return Backend.backendForUrl(url).load(url);
  }

  static backendForSchema(schema) {
    for (var b of Backend.backends) {
      if (_.includes(b.schemas(), schema)) {
        return b;
      }
    }

    return null;
  }

  static backendForUrl(url) {
    var schema = url.replace(/:.*$/, "");
    return Backend.backendForSchema(schema);
  }
}

module.exports = Backend;
