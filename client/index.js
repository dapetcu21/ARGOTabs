require('./core/css/index.styl');
require('file?name=favicon.ico!./core/assets/favicon.ico');

const UIController = require('./core/uicontroller')
const templateIndex = require('./core/templates/index.jade');

const body = document.body;
body.innerHTML = templateIndex() + body.innerHTML;

window.ARGOTabs = {};
window.ARGOTabs.uiController = new UIController();
