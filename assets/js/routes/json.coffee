define ->
  (ui, $routeProvider) ->
    $routeProvider.when '/json',
      template: '<p>{{text}}</p>'
      controller: [ '$scope', ($scope) ->
        $scope.$watch 'tournament', (value) ->
          if value?
            $scope.text = value.toFile()
      ]
