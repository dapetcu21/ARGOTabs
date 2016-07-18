define ['../models/club', './templates'], (Club, templates) ->
  class Clubs
    constructor: (@ui) ->
    sidebarCategory: -> 'Participants'
    sidebarItem: ->
      name: 'Clubs'
      sortToken: 1
    route: -> '/clubs'
    routeOpts: ->
      ui = @ui
      result =
        template: templates.view()
        controller: [ '$scope', ($scope) ->
          $scope.addClub = ->
            tournament = ui.tournament
            club = new Club tournament
            tournament.clubs.push club

          $scope.removeClub = (index) ->
            array =  ui.tournament.clubs
            club = array[index]
            club.destroy()
            array.splice index, 1

          return
        ]
