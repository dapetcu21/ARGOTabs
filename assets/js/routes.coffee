define ['unimplemented'], (Unimplemented) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented(ui, $routeProvider)
      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

