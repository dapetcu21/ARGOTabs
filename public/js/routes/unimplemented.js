(function() {
  define(function() {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/unimplemented', {
        templateUrl: 'partials/unimplemented.html'
      });
    };
  });

}).call(this);
