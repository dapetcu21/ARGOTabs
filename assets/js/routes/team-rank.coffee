define ["underscore"], ->
  (ui, $routeProvider) ->
    $routeProvider.when '/team-rank',
      templateUrl: 'partials/team-rank.html'
      controller: [ '$scope', ($scope) ->
        baseRoundIds = ->
          tournament = $scope.tournament
          rf = tournament.rankFromTeams
          objs = {}
          if rf.all
            for round in tournament.rounds
              if round.paired
                objs[round.id] = true
          else
            for round in tournament.rounds
              if round.paired and rf[round.id]
                objs[round.id] = true
          return objs

        baseRounds = (ids) ->
          r = []
          ids ?= baseRoundIds()
          for round in $scope.tournament.rounds
            if ids[round.id]
              r.push round
          return r

        refreshStats = (rounds) ->
          tournament = $scope.tournament
          teams = $scope.teams = tournament.teams.slice(0)
          rounds ?= baseRounds()
          for team in teams
            team.stats = team.getStats rounds
          teams.sort (a,b) -> a.stats.score < b.stats.score

        roundIds = null
        $scope.$watch (-> JSON.stringify roundIds = baseRoundIds()), (v) ->
          refreshStats baseRounds roundIds
      ]
