(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/clubs', {
        templateUrl: 'partials/clubs.html',
        controller: [
          '$scope', function($scope) {
            return $scope.ui = ui;
          }
        ]
      });
    };
  });

}).call(this);
