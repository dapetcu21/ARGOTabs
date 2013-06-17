# for more info on require config, see http://requirejs.org/docs/api.html#config
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
  shim:
    'jquery.bootstrap': ['jquery']
    'jquery.transit': ['jquery']
    filereader: ['jquery']

require ['jquery.bootstrap', 'uicontroller', 'globals'], (bs, UIController, globals) ->
  globals.uiController = new UIController()

