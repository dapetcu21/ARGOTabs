define ['routes/unimplemented', 'routes/json', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms', 'routes/rounds'], (Unimplemented, Json, Clubs, Dashboard, Teams, Judges, Rooms, Rounds) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      Dashboard ui, $routeProvider
      Teams ui, $routeProvider
      Judges ui, $routeProvider
      Rooms ui, $routeProvider
      Rounds ui, $routeProvider
      Json ui, $routeProvider

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

