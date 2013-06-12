(function() {
  require.config({
    baseUrl: '/js',
    paths: {
      jquery: '/components/jquery/jquery',
      'jquery.bootstrap': '/components/bootstrap/js/bootstrap',
      'jquery.transit': '/components/jquery.transit/jquery.transit',
      filereader: '/components/filereader/filereader'
    },
    shim: {
      'jquery.bootstrap': ['jquery'],
      'jquery.transit': ['jquery']
    }
  });

  require(['uicontroller', 'globals'], function(UIController, globals) {
    return globals.uiController = new UIController();
  });

}).call(this);
