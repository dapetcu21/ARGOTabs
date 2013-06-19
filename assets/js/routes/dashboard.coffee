define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/',
      templateUrl: 'partials/dashboard.html'
      controller: [ '$scope', ($scope) ->
      ]
        
