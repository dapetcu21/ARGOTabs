class UrlRoute {
  routeOpts () {
    return {
      redirectTo: function (routeParams, location) {
        var route = window.location.href

        setTimeout(function () {
          var uic = window.ARGOTabs.uiController
          uic.previousRoute = route

          return uic.loadSession((function () {}), function () {
            uic.saveSession(uic.tournament)

            if (uic.openController) {
              return uic.openController.openModal.modal('hide')
            }
          })
        }, 0)

        return '/'
      }
    }
  }

  route () {
    return function ($routeProvider) {
      return $routeProvider.when('/url/:rest*', this.routeOpts())
    }
  }
}

module.exports = UrlRoute
