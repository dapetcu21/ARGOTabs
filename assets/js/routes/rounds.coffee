define ['team', 'judge', 'round', 'util', 'alertcontroller'], (Team, Judge, Round, Util, AlertController) ->
  (ui, $routeProvider) ->
    $routeProvider.when '/rounds/:roundIndex',
      templateUrl: 'partials/rounds.html'
      controller: [ '$scope', '$routeParams', '$compile', ($scope, $routeParams, $compile) ->
        index = $routeParams.roundIndex - 1
        round = $scope.round = $scope.tournament.rounds[index]
        $scope.ranks = Judge.ranks
        $scope.rankStrings = Judge.rankStrings
        $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]

        $scope.parseInt = (s) ->
          return 0 if s == ''
          return parseInt s

        $scope.parseFloat = (s) ->
          return 0 if s == ''
          return parseFloat s

        $scope.truncFloat = (v, prec) ->
          s = v.toFixed(prec)
          if s.indexOf('.') != -1
            s.replace /\.?0*$/, ''
          else
            s

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
            div.animate
              scrollTop: div[0].scrollHeight
            , 500

          $scope.pairingTeams.splice index, 1

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
          noBallots = round.ballotsPerMatchSolved()
          sc.votes = ballot.getVotesForBallots noBallots
          sc.speakers = [ballot.teams[0].players, ballot.teams[1].players]
          n = sc.votes.length

          sc.winner = (vote) ->
            if vote.prop > vote.opp
              "prop"
            else
              "opp"

          sc.roles = ballot.getSpeakerRoles()
          sc.sides = ['Prop', 'Opp']
          sc.sidesClass = ['prop', 'opp']
          sc.validPlayer = (el, v) ->
            c = 0
            for i in [0..2]
              c++ if v[i] == el
            return c

          noBallots = 0
          for i in [0...n]
            ((i) ->
              vote = sc.votes[i]
              nb = vote.ballots
              noBallots += nb
              if not vote.judge and not ballot.locked
                sc.noJudgesWarning = true
              vote.aux =
                decisionValid: true
                validSplits: [_.range((nb/2>>0)+1, nb+1), _.range((nb/2>>0)+1)]
                winner: 0

              sc.$watch (-> vote.prop), (v) ->
                vote.opp = vote.ballots - vote.prop
              sc.$watch (-> vote.opp), (v) ->
                vote.prop = vote.ballots - vote.opp
                
              sc.$watch (-> pointsWinner vote), (v) ->
                vote.aux.decisionValid = true
                if vote.prop > vote.opp
                  win = vote.prop
                  loss = vote.opp
                else
                  win = vote.opp
                  loss = vote.prop
                if v == 0
                  vote.prop = win
                  vote.opp = loss
                  vote.aux.winner = 0
                else if v == 1
                  vote.prop = loss
                  vote.opp = win
                  vote.aux.winner = 1
                else
                  vote.aux.decisionValid = false
            ) i

          sc.lockJudgesInfo = not ballot.locked and not sc.noJudgesWarning

          if n > 1
            sc.votes.push total =
              judge:
                name: "Total"
              scores: [[70, 70, 70, 35], [70, 70, 70, 35]]
              total: true
              aux:
                decisionValid: true
                validSplits: [_.range((noBallots/2>>0)+1, noBallots+1), _.range((noBallots/2>>0)+1)]
                winner: 0
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

            sc.$watch ->
              for k in [0...n]
                if not sc.votes[k].aux.decisionValid
                  return false
              return true
            , (v) -> sc.votes[n].aux.decisionValid = v

          pointsWinner = (vote) ->
            scp = vote.scores[0]
            sco = vote.scores[1]
            tp = scp[0] + scp[1] + scp[2] + scp[3]
            to = sco[0] + sco[1] + sco[2] + sco[3]
            if tp > to
              0
            else if tp < to
              1
            else
              2

          new AlertController
            buttons: ['Cancel', 'Ok']
            cancelButtonIndex: 0
            width: 700
            title: (if ballot.prop then '<span class="prop">'+ballot.teams[0].name+'</span>' else '<span>Bail</span>') +
              '<span> vs. </span>' +
              (if ballot.opp then '<span class="opp">'+ballot.teams[1].name+'</span>' else '<span>Bail</span>')
            htmlMessage: $compile(templates.ballotSheet())(sc)
            onClick: (alert, button) ->
              sc.$apply ->
                sc.drawsError = false
                sc.outOfRangeError = false
              if button == 1
                for vote in sc.votes
                  continue if vote.total
                  for i in [0..1]
                    for j in [0..2]
                      nr = vote.scores[i][j]
                      if nr < 60 or nr > 80
                        sc.$apply -> sc.outOfRangeError = true
                        return
                    nr = vote.scores[i][3]
                    if nr < 30 or nr > 40
                      sc.$apply -> sc.outOfRangeError = true
                      return
                  if not vote.aux.decisionValid
                    sc.$apply -> sc.drawsError = true
                    return
                ballot.votes = _.filter sc.votes, (x) -> !x.total
                ballot.roles = [sc.roles[0].roles, sc.roles[1].roles]
                sc.$destroy()
                sc = null

                for vote in ballot.votes
                  delete vote.aux
                ballot.locked = true

                alert.modal 'hide'
            onDismissed: (alert) ->
              sc.$destroy() if sc?

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
