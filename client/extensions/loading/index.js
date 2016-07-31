const templateView = require('./templates/view.jade');

class NotFound {
  routeOpts() {
    return { template: templateView() };
  }

  route() {
    return function($routeProvider) {
      return $routeProvider.when("/loading", this.routeOpts());
    };
  }
}

module.exports = NotFound;
