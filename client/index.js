require('./core/css/index.styl')
require('file?name=favicon.ico!./core/assets/favicon.ico')

const templateIndex = require('./core/templates/index.jade')

const body = document.body
body.innerHTML = templateIndex() + body.innerHTML

const UIController = require('./core/uicontroller')
window.ARGOTabs = {}
window.ARGOTabs.uiController = new UIController()
