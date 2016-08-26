const templateView = require('./templates/view.jade')

class NotFound {
  routeOpts () {
    return { template: templateView() }
  }

  route () {
    return function ($routeProvider) {
      $routeProvider.when('/404', this.routeOpts())

      return $routeProvider.otherwise({
        redirectTo: '/404'
      })
    }
  }
}

module.exports = NotFound
