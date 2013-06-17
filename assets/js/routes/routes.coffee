define ['routes/unimplemented', 'routes/clubs', 'routes/dashboard', 'routes/teams'], (Unimplemented, Clubs, Dashboard, Teams) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      Dashboard ui, $routeProvider
      Teams ui, $routeProvider

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

