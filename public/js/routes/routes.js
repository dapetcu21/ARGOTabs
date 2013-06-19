(function() {
  define(['routes/unimplemented', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms'], function(Unimplemented, Clubs, Dashboard, Teams, Judges, Rooms) {
    return function(ui) {
      return ui.app.config([
        '$routeProvider', function($routeProvider) {
          Unimplemented(ui, $routeProvider);
          Clubs(ui, $routeProvider);
          Dashboard(ui, $routeProvider);
          Teams(ui, $routeProvider);
          Judges(ui, $routeProvider);
          Rooms(ui, $routeProvider);
          return $routeProvider.otherwise({
            redirectTo: '/unimplemented'
          });
        }
      ]);
    };
  });

}).call(this);
