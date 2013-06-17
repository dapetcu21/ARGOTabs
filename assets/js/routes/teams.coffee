define ['team'], (Team) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/teams',
      templateUrl: 'partials/teams.html'
      controller: [ '$scope', ($scope) ->
        $scope.ui = ui
        $scope.addTeam = ->
          tournament = ui.tournament
          team = new Team tournament
          tournament.teams.push team
          setTimeout ->
            $('#teams-table tr:nth-last-child(2) td:nth-child(2)').click()
          , 1
        $scope.removeTeam = (index) ->
          array = ui.tournament.teams
          team = array[index]
          array.splice(index, 1)
          if team.club
            team.club.removeTeam(team)
        $scope.noColumns = (hover) ->
          if hover then 2 else 3
        $scope.initRepeat = (iScope) ->
          iScope.$watch ->
            iScope.team.club
          , (newValue, oldValue) ->
            return if newValue == oldValue
            team = iScope.team
            if oldValue
              console.log 'old: ', oldValue.name
              oldValue.removeTeam(team)
            if newValue
              console.log 'new: ', newValue.name
              newValue.addTeam(team)
        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a
      ]
        
