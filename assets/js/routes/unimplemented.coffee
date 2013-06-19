define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/unimplemented',
      templateUrl: 'partials/unimplemented.html'
