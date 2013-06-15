define ['unimplemented', 'clubs'], (Unimplemented, Clubs) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

