define ['team', 'judge'], (Team, Judge) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/rounds/:roundIndex',
      templateUrl: 'partials/rounds.html'
      controller: [ '$scope', '$routeParams', ($scope, $routeParams) ->
        index = $routeParams.roundIndex - 1
        round = $scope.round = $scope.tournament.rounds[index]
        $scope.ranks = Judge.ranks
        $scope.rankStrings = Judge.rankStrings

        $scope.addAllTeams = ->
          for team in $scope.tournament.teams
            team.rounds[round.id].participates = true

        $scope.removeAllTeams = ->
          for team in $scope.tournament.teams
            team.rounds[round.id].participates = false

        $scope.addAllJudges= ->
          for judge in $scope.tournament.judges
            judge.rounds[round.id].participates = true

        $scope.removeAllJudges = ->
          for judge in $scope.tournament.judges
            judge.rounds[round.id].participates = false

        $scope.removeShadows = ->
          for judge in $scope.tournament.judges
            if judge.rank == Judge.shadowRank
              judge.rounds[round.id].participates = false

        $scope.sortByRank = ->
          round.sortByRank round.teams

        $scope.pair = ->
          console.log "pair"

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a

        $scope.nilPlaceholder = (a, p) ->
          if not a?
            return p
          return a
      ]
