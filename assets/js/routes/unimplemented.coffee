define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/unimplemented',
      templateUrl: 'partials/unimplemented.html'
      controller: [ '$scope', ($scope) ->
        $scope.ui = ui
      ]
        
