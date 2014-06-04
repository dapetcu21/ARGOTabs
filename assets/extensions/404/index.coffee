define ->
  class NotFound
    routeOpts: ->
      templateUrl: 'partials/404.html'
    route: ->
      ($routeProvider) ->
        $routeProvider.when '/404', @routeOpts()
        $routeProvider.otherwise
          redirectTo: '/404'
