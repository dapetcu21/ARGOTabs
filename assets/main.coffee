# for more info on require config, see http://requirejs.org/docs/api.html#config
#
require.config
  baseUrl: '/'
  waitSeconds: 0
  paths:
    jquery: '/components/jquery/jquery'
    'jquery.bootstrap': '/components/bootstrap/js/bootstrap'
    'jquery.transit': '/components/jquery-transit/jquery-transit'
    filereader: '/components/filereader/filereader'
    angular: '/components/angular/angular'
    'angular-route': '/components/angular/angular-route'
    B64: '/components/B64/base64'
    cookies: '/components/cookies/cookies'
    underscore: '/components/underscore/underscore'
    html2canvas: '/components/html2canvas/html2canvas'
    'jquery.bootstrap.contextmenu': '/components/sydcanem-bootstrap-contextmenu/bootstrap-contextmenu'
    'jquery.event.drag': '/components/jquery-event-drag/jquery-event-drag'
    rainbow: '/components/rainbow/rainbow'
  shim:
    'jquery.bootstrap': ['jquery']
    'jquery.transit': ['jquery']
    'jquery.bootstrap.contextmenu': ['jquery.bootstrap']
    'jquery.event.drag': ['jquery']
    filereader: ['jquery']
    angular: ['jquery']
    'angular-route': ['angular']
    underscore:
      exports: '_'

require ['core/uicontroller'], (UIController) ->
  window.ARGOTabs = {}
  window.ARGOTabs.uiController = new UIController()

