define ['models/room', './templates'], (Room, templates) ->
  class Rooms
    constructor: (@ui) ->
    sidebarCategory: -> 'Participants'
    sidebarItem: ->
      name: 'Rooms'
      sortToken: 4
    route: -> '/rooms'
    routeOpts: ->
      ui = @ui
      result =
        template: templates.view()
        controller: [ '$scope', ($scope) ->
          $scope.addRoom = ->
            tournament = ui.tournament
            room = new Room tournament
            tournament.rooms.push room
            
          $scope.removeRoom = (index) ->
            array = ui.tournament.rooms
            array[index].destroy()
            array.splice(index, 1)

          $scope.canRemoveRoom = (room) ->
            for round in ui.tournament.rounds
              ropts = room.rounds[round.id]
              if ropts? and ropts.ballot?
                return false
            return true
        ]
