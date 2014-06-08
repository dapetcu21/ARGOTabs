define ['./templates'], (templates) ->
  class NotFound
    routeOpts: ->
      template: templates.view()
    route: ->
      ($routeProvider) ->
        $routeProvider.when '/404', @routeOpts()
        $routeProvider.otherwise
          redirectTo: '/404'
