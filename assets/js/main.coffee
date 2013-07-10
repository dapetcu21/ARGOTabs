# for more info on require config, see http://requirejs.org/docs/api.html#config
#
require.config
  baseUrl: '/js'
  paths:
    jquery: '/components/jquery/jquery'
    'jquery.bootstrap': '/components/bootstrap/js/bootstrap'
    'jquery.transit': '/components/jquery.transit/jquery.transit'
    filereader: '/components/filereader/filereader'
    angular: '/components/angular/angular'
    B64: '/components/B64/base64'
    cookies: '/components/cookies/cookies'
    underscore: '/components/underscore/underscore'
    html2canvas: '/components/html2canvas/html2canvas'
    'jquery.bootstrap.contextmenu': '/components/sydcanem-bootstrap-contextmenu/bootstrap-contextmenu'
    'jquery.event.drag': '/components/jquery.event.drag/jquery.event.drag'
  shim:
    'jquery.bootstrap': ['jquery']
    'jquery.transit': ['jquery']
    'jquery.bootstrap.contextmenu': ['jquery.bootstrap']
    'jquery.event.drag': ['jquery']
    filereader: ['jquery']
    angular: ['jquery']

require ['uicontroller', 'globals', 'jquery.bootstrap'], (UIController, globals) ->
  globals.uiController = new UIController()

