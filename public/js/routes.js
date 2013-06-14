(function() {
  define(['unimplemented'], function(Unimplemented) {
    return function(ui) {
      return ui.app.config([
        '$routeProvider', function($routeProvider) {
          Unimplemented(ui, $routeProvider);
          return $routeProvider.otherwise({
            redirectTo: '/unimplemented'
          });
        }
      ]);
    };
  });

}).call(this);
