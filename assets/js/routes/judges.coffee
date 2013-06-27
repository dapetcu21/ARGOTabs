define ['judge'], (Judge) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/judges',
      templateUrl: 'partials/judges.html'
      controller: [ '$scope', ($scope) ->
        $scope.ranks = [0, 1, 2]
        $scope.rankString = 'ABC'

        $scope.addJudge = ->
          tournament = ui.tournament
          judge = new Judge tournament
          tournament.judges.push judge
          
        $scope.removeJudge = (index) ->
          array = ui.tournament.judges
          array[index].destroy()
          array.splice(index, 1)

        $scope.initRepeat = (iScope) ->
          iScope.$watch ->
            iScope.o.club
          , (newValue, oldValue) ->
            return if newValue == oldValue
            judge = iScope.o
            if oldValue
              oldValue.removeJudge(judge)
            if newValue
              newValue.addJudge(judge)

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a
      ]
