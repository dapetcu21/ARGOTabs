define ["underscore"], ->
  (ui, $routeProvider) ->
    $routeProvider.when '/team-rank',
      templateUrl: 'partials/team-rank.html'
      controller: [ '$scope', ($scope) ->
        refreshStats = ->
          tournament = $scope.tournament
          teams = $scope.teams = tournament.teams.slice(0)
          rounds = _.filter tournament.rounds, (o) -> o.paired
          for team in teams
            team.stats = team.getStats rounds
          teams.sort (a,b) -> a.stats.score < b.stats.score

        refreshStats()
      ]
