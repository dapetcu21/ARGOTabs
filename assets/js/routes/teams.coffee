define ['team'], (Team) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/teams',
      templateUrl: 'partials/teams.html'
      controller: [ '$scope', ($scope) ->
        $scope.addTeam = ->
          tournament = ui.tournament
          team = new Team tournament
          tournament.teams.push team

        $scope.removeTeam = (index) ->
          array = ui.tournament.teams
          array[index].destroy()
          array.splice(index, 1)

        $scope.canRemoveTeam = (team) ->
          for round in ui.tournament.rounds
            ropts = team.rounds[round.id]
            if ropts? and ropts.ballot?
              return false
          return true

        $scope.canRemovePlayer = (player) ->
          team = player.team
          for round in ui.tournament.rounds
            ropts = team.rounds[round.id]
            console.log ropts.ballot.roles
            if ropts? and ropts.ballot? and ropts.ballot.locked and ropts.ballot.roles?
              for i in [0...2]
                for j in [0...4]
                  if ropts.ballot.roles[i][j] == player
                    return false
          return true

        $scope.initRepeat = (iScope) ->
          iScope.$watch ->
            iScope.o.club
          , (newValue, oldValue) ->
            return if newValue == oldValue
            team = iScope.o
            if oldValue
              oldValue.removeTeam(team)
            if newValue
              newValue.addTeam(team)

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a
      ]
