define ['team', 'judge', 'round', 'util', 'alertcontroller'], (Team, Judge, Round, Util, AlertController) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/rounds/:roundIndex',
      templateUrl: 'partials/rounds.html'
      controller: [ '$scope', '$routeParams', '$compile', ($scope, $routeParams, $compile) ->
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
          $scope.pairOpts =
            algorithm: 0
            shuffle: false
            balance: true
            brackets: 1
          prev = $scope.prevRounds = round.previousRounds()
          $scope.pairAlgorithms = if prev.length then Round.allAlgos else Round.initialAlgos
          $scope.algoName = Round.algoName
          $scope.parseInt = (s) ->
            return 0 if s == ''
            return parseInt s
          $scope.pairingTeams = round.pairingTeams()

          new AlertController
            buttons: ['Cancel', 'Ok']
            cancelButtonIndex: 0
            title: 'Round '+(index+1)+' pairing'
            htmlMessage: $compile(templates.pairModal())($scope)
            onClick: (alert, button) ->
              if button == 1
                alert.modal 'hide'
                Util.safeApply $scope, ->
                  round.pair $scope.pairOpts

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a

        $scope.teamPlaceholder = (a) ->
          if not a?
            return {name: ''}
          return a

        $scope.nilPlaceholder = (a, p) ->
          if not a?
            return p
          return a
      ]
