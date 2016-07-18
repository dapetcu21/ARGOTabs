define ['./templates'], (templates) ->
  class UrlRoute
    routeOpts: ->
      redirectTo: (routeParams, location) ->
        route = window.location.href
        setTimeout ->
          uic = window.ARGOTabs.uiController
          uic.previousRoute = route
          uic.loadSession (->), ->
            uic.saveSession uic.tournament
            if uic.openController
              uic.openController.openModal.modal 'hide'
        , 0
        return '/'
    route: ->
      ($routeProvider) ->
        $routeProvider.when '/url/:rest*', @routeOpts()
