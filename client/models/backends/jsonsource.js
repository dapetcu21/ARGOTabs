const Backend = require('../backend_import');
const Source = require('../source');

class JSONSource extends Source {
  constructor(data) {
    super({}, "data:nourl");
    this.data = data;
  }

  load(fn, fnErr = function() {}) {
    return fn(this.data);
  }

  save() {
    return;
  }

  canSave() {
    return false;
  }
}

module.exports = JSONSource;
