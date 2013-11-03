define ["team", "util", "underscore"], (Team, Util) ->
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
          Team.calculateStats teams, rounds
          sorter = tournament.teamRankSorter.boundComparator()
          teams.sort (a,b) -> sorter a.stats, b.stats

          maxScoreDec = 0
          maxReplyDec = 0
          for team in teams
            scoreDec = Util.decimalsOf team.stats.score, 2
            replyDec = Util.decimalsOf team.stats.reply, 2
            maxScoreDec = scoreDec if scoreDec > maxScoreDec
            maxReplyDec = replyDec if replyDec > maxReplyDec

          $scope.scoreDec = maxScoreDec
          $scope.replyDec = maxReplyDec

        roundIds = null
        Util.installScopeUtils $scope

        $scope.$watch (-> JSON.stringify roundIds = baseRoundIds()), (v) ->
          refreshStats baseRounds roundIds
      ]
