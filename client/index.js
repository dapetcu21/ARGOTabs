require('whatwg-fetch')
require('bootstrap/dist/css/bootstrap.css')
require('bootstrap/dist/css/bootstrap-theme.css')
require('font-awesome/css/font-awesome.css')

require('./core/css/index.styl')
require('file-loader?name=favicon.ico!./core/assets/favicon.ico')

const angular = require('angular')

const Extensions = require('./core/extensions')
const extensions = new Extensions()

window.ARGOTabs = window.ARGOTabs || {}
window.ARGOTabs.extensions = extensions

angular.bootstrap(document, extensions.angularModules())

const ReactDOM = require('react-dom')
const React = require('react')
const App = require('./components/App').default

ReactDOM.render(<App />, document.getElementById('react-root'))
