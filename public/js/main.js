(function() {
  require.config({
    baseUrl: '/js',
    paths: {
      jquery: '/components/jquery/jquery',
      'jquery.bootstrap': '/components/bootstrap/js/bootstrap',
      'jquery.transit': '/components/jquery.transit/jquery.transit',
      filereader: '/components/filereader/filereader',
      angular: '/components/angular/angular',
      B64: '/components/B64/base64',
      cookies: '/components/cookies/cookies',
      underscore: '/components/underscore/underscore',
      'jquery.bootstrap.contextmenu': '/components/sydcanem-bootstrap-contextmenu/bootstrap-contextmenu'
    },
    shim: {
      'jquery.bootstrap': ['jquery'],
      'jquery.transit': ['jquery'],
      'jquery.bootstrap.contextmenu': ['jquery.bootstrap'],
      filereader: ['jquery'],
      angular: ['jquery']
    }
  });

  require(['uicontroller', 'globals', 'jquery.bootstrap', 'jquery.bootstrap.contextmenu'], function(UIController, globals) {
    return globals.uiController = new UIController();
  });

}).call(this);
