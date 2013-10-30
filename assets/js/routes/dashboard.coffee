define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/',
      templateUrl: 'partials/dashboard.html'
      controller: [ '$scope', ($scope) ->
        $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]
        $scope.infinity = 10000
        $scope.maxPanelChoices = [$scope.infinity, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        $scope.infinityName = (o, inf, name) -> if o == inf then name else o

        $scope.parseInt = (s) ->
          return 0 if s == ''
          return parseInt s
        $scope.yesNo = (v,y,n) ->
          if v
            y
          else
            n
      ]
        
