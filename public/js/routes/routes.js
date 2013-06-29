(function() {
  define(['routes/unimplemented', 'routes/json', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms', 'routes/rounds'], function(Unimplemented, Json, Clubs, Dashboard, Teams, Judges, Rooms, Rounds) {
    return function(ui) {
      return ui.app.config([
        '$routeProvider', function($routeProvider) {
          Unimplemented(ui, $routeProvider);
          Clubs(ui, $routeProvider);
          Dashboard(ui, $routeProvider);
          Teams(ui, $routeProvider);
          Judges(ui, $routeProvider);
          Rooms(ui, $routeProvider);
          Rounds(ui, $routeProvider);
          Json(ui, $routeProvider);
          return $routeProvider.otherwise({
            redirectTo: '/unimplemented'
          });
        }
      ]);
    };
  });

}).call(this);
