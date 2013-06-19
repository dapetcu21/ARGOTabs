define ['routes/unimplemented', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms'], (Unimplemented, Clubs, Dashboard, Teams, Judges, Rooms) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      Dashboard ui, $routeProvider
      Teams ui, $routeProvider
      Judges ui, $routeProvider
      Rooms ui, $routeProvider

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

