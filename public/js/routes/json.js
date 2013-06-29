(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/json', {
        template: '<p>{{text}}</p>',
        controller: [
          '$scope', function($scope) {
            return $scope.$watch('tournament', function(value) {
              if (value != null) {
                return $scope.text = value.toFile();
              }
            });
          }
        ]
      });
    };
  });

}).call(this);
