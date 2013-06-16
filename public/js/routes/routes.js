(function() {
  define(['routes/unimplemented', 'routes/clubs', 'routes/dashboard'], function(Unimplemented, Clubs, Dashboard) {
    return function(ui) {
      return ui.app.config([
        '$routeProvider', function($routeProvider) {
          Unimplemented(ui, $routeProvider);
          Clubs(ui, $routeProvider);
          Dashboard(ui, $routeProvider);
          return $routeProvider.otherwise({
            redirectTo: '/unimplemented'
          });
        }
      ]);
    };
  });

}).call(this);
