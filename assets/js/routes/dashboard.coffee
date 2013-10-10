define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/',
      templateUrl: 'partials/dashboard.html'
      controller: [ '$scope', ($scope) ->
        $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]
        $scope.parseInt = (s) ->
          return 0 if s == ''
          return parseInt s
      ]
        
