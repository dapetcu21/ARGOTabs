define ['club'], (Club) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/clubs',
      templateUrl: 'partials/clubs.html'
      controller: [ '$scope', ($scope) ->
        $scope.addClub = ->
          console.log 'addClub'
          tournament = ui.tournament
          club = new Club tournament
          tournament.clubs.push club

        $scope.removeClub = (index) ->
          console.log 'removeClub(',index,')'
          array =  ui.tournament.clubs
          club = array[index]
          club.destroy()
          array.splice index, 1

        return
      ]
        
