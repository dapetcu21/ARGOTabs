(function() {
  define(function() {
    return function(ui, $routeProvider) {
      var UnimplementedCtrl;
      UnimplementedCtrl = function($scope) {
        return $scope.ui = ui;
      };
      return $routeProvider.when('/unimplemented', {
        templateUrl: 'partials/unimplemented.html',
        controller: UnimplementedCtrl
      });
    };
  });

}).call(this);
