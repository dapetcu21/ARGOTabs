(function() {
  define(['room'], function(Room) {
    return function(ui, $routeProvider) {
      return $routeProvider.when('/rooms', {
        templateUrl: 'partials/rooms.html',
        controller: [
          '$scope', function($scope) {
            $scope.addRoom = function() {
              var room, tournament;
              tournament = ui.tournament;
              room = new Room(tournament);
              return tournament.rooms.push(room);
            };
            return $scope.removeRoom = function(index) {
              var array;
              array = ui.tournament.rooms;
              array[index].destroy();
              return array.splice(index, 1);
            };
          }
        ]
      });
    };
  });

}).call(this);
