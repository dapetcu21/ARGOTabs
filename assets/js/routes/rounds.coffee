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
        $scope.infinity = 10000
        $scope.maxPanelChoices = [$scope.infinity, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        $scope.infinityName = (o, inf, name) -> if o == inf then name else o

        $scope.yesNoInherit = (v,y,n,i) ->
          if v == null
            i
          else
            if v
              y
            else
              n

        $scope.yesNo = (v,y,n) ->
          if v
            y
          else
            n

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

        $scope.judgeUd = (ballot, shadow) ->
          {ballot: ballot, shadow: shadow}

        $scope.judgeGroupTest = (fromList, toList) ->
          ballot = toList.ud.ballot
          return true if fromList == toList
          return false if ballot.locked or not ballot.teams[0] or not ballot.teams[1]
          toList.ud.shadow or ballot.judges.length < round.ballotsPerMatchSolved()

        $scope.judgeMove = (fromList, fromIndex, toList, toIndex) ->
          if fromList == toList and toIndex > fromIndex
            toIndex--
          el = fromList.model.splice(fromIndex, 1)[0]
          toList.model.splice toIndex, 0, el
          opts = el.rounds[round.id]
          opts.ballot = toList.ud.ballot
          opts.shadow = toList.ud.shadow

        updateStats = (ballot) ->
          pres0 = ballot.teams[0]? and ballot.presence[0]
          pres1 = ballot.teams[1]? and ballot.presence[1]
          if not pres0 and not pres1
            ballot.stats =
              scores: ['not played', '']
              winClass: 'hidden-true'
              classes: ['', 'hidden-true']
          else if not pres0 or not pres1
            ballot.stats =
              scores: ['default win', '']
              winClass: 'hidden-true'
              classes: [(if pres0 then 'prop' else 'opp'), 'hidden-true']
          else if ballot.locked
            s = [0, 0]
            w = [0, 0]
            for side in [0..1]
              ballots = 0
              for vote in ballot.votes
                for i in [0...4]
                  s[side] += vote.scores[side][i] * vote.ballots
                w[side] += if side then vote.opp else vote.prop
                ballots += vote.ballots
              s[side] /= ballots

            ballot.stats =
              scores: s
              winClass: if w[0]>w[1] then 'prop' else 'opp'
              classes: ['', '']
          else
            ballot.stats =
              scores: ['unfilled', '']
              winClass: 'hidden-true'
              classes: ['muted-true', '']
          return

        for b in round.ballots
          updateStats b

        $scope.assignJudges = ->
          round.assignJudges()

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
                  for b in round.ballots
                    updateStats b

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
          return if not ballot.teams[0]? or not ballot.teams[1]?
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
          sc.presence = [ballot.presence[0], ballot.presence[1]]
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
            title: '<span class="prop">'+ballot.teams[0].name+'</span><span> vs. </span><span class="opp">'+ballot.teams[1].name+'</span>'
            htmlMessage: $compile(templates.ballotSheet())(sc)
            onClick: (alert, button) ->
              sc.$apply ->
                sc.drawsError = false
                sc.outOfRangeError = false
              voteError = false
              pres = sc.presence[0] and sc.presence[1]
              if button == 1
                for vote in sc.votes
                  continue if vote.total
                  for i in [0..1]
                    for j in [0..2]
                      nr = vote.scores[i][j]
                      if nr < 60 or nr > 80
                        voteError = true
                        if pres
                          sc.$apply -> sc.outOfRangeError = true
                          return
                    nr = vote.scores[i][3]
                    if nr < 30 or nr > 40
                      voteError = true
                      if pres
                        sc.$apply -> sc.outOfRangeError = true
                        return
                  if not vote.aux.decisionValid
                    voteError = true
                    if pres
                      sc.$apply -> sc.drawsError = true
                      return
                if not voteError
                  ballot.votes = _.filter sc.votes, (x) -> !x.total
                ballot.roles = [sc.roles[0].roles, sc.roles[1].roles]
                ballot.presence = [sc.presence[0], sc.presence[1]]
                sc.$destroy()
                sc = null

                for vote in ballot.votes
                  delete vote.aux
                ballot.locked = true

                $scope.$apply ->
                  updateStats ballot
                alert.modal 'hide'
            onDismissed: (alert) ->
              sc.$destroy() if sc?

        $scope.eliminateNil = (a) ->
          if not a?
            return ''
          return a

        $scope.namePlaceholder = (a, p='') ->
          if not a?
            return {name: p}
          return a

        $scope.nilPlaceholder = (a, p) ->
          if not a?
            return p
          return a
      ]
