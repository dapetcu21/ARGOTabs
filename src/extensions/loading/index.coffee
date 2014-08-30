define ['./templates'], (templates) ->
  class NotFound
    routeOpts: ->
      template: templates.view()
    route: ->
      ($routeProvider) ->
        $routeProvider.when '/loading', @routeOpts()
