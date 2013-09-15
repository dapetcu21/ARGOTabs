define ['team', 'judge', 'round', 'util', 'alertcontroller'], (Team, Judge, Round, Util, AlertController) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/rounds/:roundIndex',
      templateUrl: 'partials/rounds.html'
      controller: [ '$scope', '$routeParams', '$compile', ($scope, $routeParams, $compile) ->
        index = $routeParams.roundIndex - 1
        round = $scope.round = $scope.tournament.rounds[index]
        $scope.ranks = Judge.ranks
        $scope.rankStrings = Judge.rankStrings

        $scope.parseInt = (s) ->
          return 0 if s == ''
          return parseInt s

        $scope.parseFloat = (s) ->
          return 0 if s == ''
          return parseFloat s

        $scope.truncFloat = (v, prec) ->
          v.toFixed(prec).replace /\.?0*$/, ''

        $scope.validateMinMax = (v, min, max) ->
          return min <= v and v <= max

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

        $scope.editBallot = (index) ->
          sc = $scope.$new()
          ballot = round.ballots[index]
          noBallots = 3
          sc.votes = ballot.getVotesForBallots noBallots
          n = sc.votes.length
          if n > 1
            sc.votes.push total = {
              judge:
                name: "Total"
              scores: [[70, 70, 70, 35], [70, 70, 70, 35]]
              total: true
            }
            for i in [0...2]
              for j in [0...4]
                ((i, j) ->
                  sc.$watch ->
                    s = 0
                    for vote in sc.votes
                      if not vote.total
                        s += vote.scores[i][j] * vote.ballots
                    s / noBallots
                  , (v) -> total.scores[i][j] = v
                ) i, j

            sc.$watch ->
              s = 0
              for vote in sc.votes
                if not vote.total
                  s += vote.prop
              s
            , (v) -> total.prop = v

            sc.$watch ->
              s = 0
              for vote in sc.votes
                if not vote.total
                  s += vote.opp
              s
            , (v) -> total.opp = v

          new AlertController
            buttons: ['Cancel', 'Ok']
            cancelButtonIndex: 0
            width: 700
            title: (if ballot.prop then '<span class="prop">'+ballot.prop.name+'</span>' else '<span>Bail</span>') +
              '<span> vs. </span>' +
              (if ballot.opp then '<span class="opp">'+ballot.opp.name+'</span>' else '<span>Bail</span>')
            htmlMessage: $compile(templates.ballotSheet())(sc)
            onClick: (alert, button) ->
              if button == 1
                console.log 'do shit'
                alert.modal 'hide'
            onDismissed: (alert) ->
              sc.$destroy()

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
