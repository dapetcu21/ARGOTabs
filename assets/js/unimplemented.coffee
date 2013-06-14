define ->
  (ui, $routeProvider) ->
    UnimplementedCtrl = ($scope) ->
      $scope.ui = ui
    $routeProvider.when '/unimplemented',
      templateUrl: 'partials/unimplemented.html'
      controller: UnimplementedCtrl
        
