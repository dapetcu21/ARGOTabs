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

        $scope.addAllRooms= ->
          for room in $scope.tournament.rooms
            room.rounds[round.id].participates = true

        $scope.removeAllRooms = ->
          for room in $scope.tournament.rooms
            room.rounds[round.id].participates = false

        $scope.sortByRank = ->
          round.sortByRank round.teams

        $scope.shuffleRooms = ->
          round.shuffleRooms()

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
          $scope.manualPairing = []

          new AlertController
            buttons: ['Cancel', 'Ok']
            cancelButtonIndex: 0
            title: 'Round '+(index+1)+' pairing'
            htmlMessage: $compile(templates.pairModal())($scope)
            onClick: (alert, button) ->
              if button == 1
                opts = $scope.pairOpts
                if opts.algorithm == 1
                  if $scope.pairingTeams.length
                    alert.find('.error-placeholder').html templates.errorAlert
                      error: 'You must pair all the teams before continuing'
                    return
                  opts.manualPairing = $scope.manualPairing
                alert.modal 'hide'
                Util.safeApply $scope, ->
                  round.pair opts

        $scope.addTeamToManualPairing = (team, index) ->
          if $scope.incompletePairing
            p = $scope.incompletePairing
            $scope.incompletePairing = null
            if not p.prop
              p.prop = team
            else if not p.opp
              p.opp = team
            else
              return
          else
            p = $scope.incompletePairing = { prop: team }
            $scope.manualPairing.push p
            div = $('.manual-pairings .span8')
            console.log div, div[0].scrollHeight
            div.animate
              scrollTop: div[0].scrollHeight
            , 500

          $scope.pairingTeams.splice index, 1
          console.log 'plm'

        $scope.removePairFromManualPairing = (pair, index) ->
          if pair.prop
            if pair.opp
              $scope.pairingTeams.splice 0, 0, pair.prop, pair.opp
            else
              $scope.pairingTeams.splice 0, 0, pair.prop
          else
            $scope.pairingTeams.splice 0, 0, pair.opp
          $scope.manualPairing.splice index, 1
          if pair == $scope.incompletePairing
            $scope.incompletePairing = null

        $scope.reverseSidesInManualPairing = (pairing) ->
          p = pairing.prop
          pairing.prop = pairing.opp
          pairing.opp = p

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a

        $scope.namePlaceholder = (a) ->
          if not a?
            return {name: ''}
          return a

        $scope.nilPlaceholder = (a, p) ->
          if not a?
            return p
          return a
      ]
