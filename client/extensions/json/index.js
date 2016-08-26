const $ = require('jquery')

class JsonView {
  route () {
    return '/json'
  }

  routeOpts () {
    return {
      template: '<div id="json-view"></div>',

      controller: ['$scope', function ($scope) {
        return $scope.$watch('tournament', function (value) {
          var el

          if (typeof value !== 'undefined' && value !== null) {
            el = $('#json-view')

            el.html(
              "<pre><code data-language='javascript'>var tournament = " + value.toFile(true) + '</pre></code>'
            )
          }
        })
      }]
    }
  }
}

module.exports = JsonView
