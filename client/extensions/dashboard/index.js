const templateView = require('./templates/view.jade')
const Util = require('../../core/util')

class Dashboard {
  sidebarCategory () {
    return 'Tournament'
  }

  sidebarItem () {
    return {
      name: 'Dashboard',
      sortToken: 1
    }
  }

  route () {
    return '/'
  }

  routeOpts () {
    return {
      template: templateView(),

      controller: ['$scope', function ($scope) {
        $scope.uncloak = true

        $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]
        $scope.infinity = 10000
        $scope.maxPanelChoices = [$scope.infinity, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

        $scope.infinityName = function (o, inf, name) {
          return (o === inf ? name : o)
        }

        $scope.priorityChoices = [0, 1]
        $scope.priorityChoiceNames = ['Assign good judges to good teams', 'Assign good judges to weak teams']
        $scope.orderChoices = [0, 1]
        $scope.orderChoiceNames = ['Assign judges to good teams first', 'Assign judges to weak teams first']
        return Util.installScopeUtils($scope)
      }]
    }
  }
}

module.exports = Dashboard
