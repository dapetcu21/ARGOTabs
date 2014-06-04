define ['rainbow'], ->
  class JsonView
    route: -> '/json'
    routeOpts: ->
      template: '<div id="json-view"></div>'
      controller: [ '$scope', ($scope) ->
        $scope.$watch 'tournament', (value) ->
          if value?
            el = $('#json-view')
            el.html "<pre><code data-language='javascript'>var tournament = " + value.toFile(true) + "</pre></code>"
            Rainbow.color(el[0])
      ]
