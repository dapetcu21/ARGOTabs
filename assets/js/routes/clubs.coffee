define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/clubs',
      templateUrl: 'partials/clubs.html'
      controller: [ '$scope', ($scope) ->
        $scope.ui = ui
      ]
        
