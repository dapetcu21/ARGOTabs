define ["core/util", "./templates"], (Util, templates) ->
  class Dashboard
    sidebarCategory: -> 'Tournament'
    sidebarItem: ->
      name: 'Dashboard'
      sortToken: 1
    route: -> '/'
    routeOpts: ->
      template: templates.view()
      controller: [ '$scope', ($scope) ->
        $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]
        $scope.infinity = 10000
        $scope.maxPanelChoices = [$scope.infinity, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        $scope.infinityName = (o, inf, name) -> if o == inf then name else o
        $scope.priorityChoices = [0, 1]
        $scope.priorityChoiceNames = ["Assign good judges to good teams", "Assign good judges to weak teams"]
        $scope.orderChoices = [0, 1]
        $scope.orderChoiceNames = ["Assign judges to good teams first", "Assign judges to weak teams first"]

        Util.installScopeUtils $scope
      ]
