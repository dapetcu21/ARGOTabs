const backends = require('./backends')
const Backend = require('./backend_import')

Backend.backends = backends.map(BackendClass => new BackendClass())
module.exports = Backend
