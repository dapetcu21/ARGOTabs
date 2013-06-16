(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/unimplemented', {
        templateUrl: 'partials/unimplemented.html',
        controller: [
          '$scope', function($scope) {
            return $scope.ui = ui;
          }
        ]
      });
    };
  });

}).call(this);
