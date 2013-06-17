define ['club'], (Club) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/clubs',
      templateUrl: 'partials/clubs.html'
      controller: [ '$scope', ($scope) ->
        $scope.ui = ui
        $scope.addClub = ->
          tournament = ui.tournament
          club = new Club tournament
          tournament.clubs.push club
          setTimeout ->
            $('#clubs-table').find('.textedit-label').last().click()
          , 1
        $scope.noColumns = (hover) ->
          if hover then 1 else 2
        $scope.removeClub = (index) ->
          ui.tournament.clubs.splice(index, 1)
      ]
        
