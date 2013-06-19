(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/', {
        templateUrl: 'partials/dashboard.html',
        controller: ['$scope', function($scope) {}]
      });
    };
  });

}).call(this);
