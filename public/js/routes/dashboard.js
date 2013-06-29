(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/', {
        templateUrl: 'partials/dashboard.html',
        controller: [
          '$scope', function($scope) {
            $scope.ballotsPerMatchOptions = [1, 3, 5, 7];
            return $scope.parseInt = function(s) {
              if (s === '') {
                return 0;
              }
              return parseInt(s);
            };
          }
        ]
      });
    };
  });

}).call(this);
