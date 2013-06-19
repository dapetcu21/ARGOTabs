define ['room'], (Room) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/rooms',
      templateUrl: 'partials/rooms.html'
      controller: [ '$scope', ($scope) ->
        $scope.ui = ui

        $scope.addRoom = ->
          tournament = ui.tournament
          room = new Room tournament
          tournament.rooms.push room
          
        $scope.removeRoom = (index) ->
          array = ui.tournament.rooms
          array[index].destroy()
          array.splice(index, 1)
      ]
