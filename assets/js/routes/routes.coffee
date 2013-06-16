define ['routes/unimplemented', 'routes/clubs', 'routes/dashboard'], (Unimplemented, Clubs, Dashboard) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      Dashboard ui, $routeProvider

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

