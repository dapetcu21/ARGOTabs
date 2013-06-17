(function() {
  define(['routes/unimplemented', 'routes/clubs', 'routes/dashboard', 'routes/teams'], function(Unimplemented, Clubs, Dashboard, Teams) {
    return function(ui) {
      return ui.app.config([
        '$routeProvider', function($routeProvider) {
          Unimplemented(ui, $routeProvider);
          Clubs(ui, $routeProvider);
          Dashboard(ui, $routeProvider);
          Teams(ui, $routeProvider);
          return $routeProvider.otherwise({
            redirectTo: '/unimplemented'
          });
        }
      ]);
    };
  });

}).call(this);
