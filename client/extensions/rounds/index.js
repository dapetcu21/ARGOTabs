const Team = require('../../models/team')
const Judge = require('../../models/judge')
const Round = require('../../models/round')
const Util = require('../../core/util')
const AlertController = require('../../core/alertcontroller')
const angular = require('angular')
const $ = require('jquery')

const templateView = require('./templates/view.jade')
const templatePairModal = require('./templates/pairModal.jade')
const templateErrorAlert = require('./templates/errorAlert.jade')
const templateRoundsSidebar = require('./templates/roundsSidebar.jade')
const templateBallotSheet = require('./templates/ballotSheet.jade')

require('./common.styl')

var ngModule = angular.module('rounds', [])

ngModule.controller('RoomController', ['$scope', function ($scope) {
  var ballot = $scope.round.ballots[$scope.$index]
  $scope.currentRoom = [ballot.room]

  return $scope.$watch('round.ballots[$index].room', function (o) {
    return $scope.currentRoom[0] = o
  })
}])

ngModule.controller('RoundController', [
  '$scope',
  '$routeParams',
  '$compile',
  function ($scope, $routeParams, $compile) {
    var index = $routeParams.roundIndex - 1
    var round = $scope.round = $scope.tournament.rounds[index]

    if (!(round != null)) {
      document.location.href = '#/404'
      return
    }

    $scope.ranks = Judge.ranks
    $scope.rankStrings = Judge.rankStrings
    $scope.ballotsPerMatchOptions = [1, 3, 5, 7, 9]
    $scope.infinity = 10000
    $scope.maxPanelChoices = [$scope.infinity, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    $scope.infinityName = function (o, inf, name) {
      return (o === inf ? name : o)
    }

    $scope.priorityChoices = [0, 1]
    $scope.priorityChoiceNames = ['Assign good judges to good teams', 'Assign good judges to weak teams']
    $scope.orderChoices = [0, 1]
    $scope.orderChoiceNames = ['Assign judges to good teams first', 'Assign judges to weak teams first']
    $scope.rankStrings = Judge.rankStrings

    $scope.naturalRoomSort = function (a, b) {
      if (!(b.room != null)) {
        return -1
      }

      if (!(a.room != null)) {
        return 1
      }

      return Util.naturalSort(a.room.name, b.room.name)
    }

    Util.installScopeUtils($scope)
    Util.extendScope($scope)

    var enterForSelection = function (e) {
      var rng
      var sel

      if (e.which === 13) {
        sel = window.getSelection()

        if (sel.rangeCount) {
          rng = sel.getRangeAt(0).commonAncestorContainer

          return (() => {
            var ballotIndex

            while (rng && rng !== document) {
              if (rng.nodeName === 'TR') {
                ballotIndex = $(rng).index()
              }

              if (rng.nodeName === 'TABLE') {
                if (rng.id === 'round-pairings-table') {
                  e.preventDefault()

                  Util.safeApply($scope, function () {
                    return $scope.editBallot(ballotIndex)
                  })
                }

                return
              }

              rng = rng.parentNode
            }
          })()
        }
      }
    }

    $(document).bind('keydown keypress', enterForSelection)

    $scope.$on('$destroy', function () {
      return $(document).unbind('keydown keypress', enterForSelection)
    })

    var _tf = $scope.truncFloat

    $scope.truncFloatN = function (v, prec) {
      if (typeof v === 'number') {
        return _tf(v, prec)
      } else {
        return v
      }
    }

    for (var judge of round.judges) {
      (function (judge) {
        return $scope.$watch(function () {
          var ropts = judge.rounds[round.id]

          if (ropts != null) {
            return ropts.participates
          } else {
            return null
          }
        }, function (v, o) {
          var ropts

          if (!(typeof v !== 'undefined' && v !== null)) {
            return
          }

          if (v === o) {
            return
          }

          if (v) {
            round.freeJudges.push(judge)
          } else {
            ropts = judge.rounds[round.id]

            if (ropts != null && ropts.ballot && !ropts.ballot.locked) {
              if (ropts.shadow) {
                Util.arrayRemove(ropts.ballot.shadows, judge)
              } else {
                Util.arrayRemove(ropts.ballot.judges, judge)
              }

              ropts.ballot = null
            } else {
              Util.arrayRemove(round.freeJudges, judge)
            }
          }

          return
        })
      })((judge))
    }

    for (var room of round.rooms) {
      (function (room) {
        return $scope.$watch(function () {
          var ropts = room.rounds[round.id]

          if (ropts != null) {
            return ropts.participates
          } else {
            return null
          }
        }, function (v, o) {
          var ropts

          if (!(typeof v !== 'undefined' && v !== null)) {
            return
          }

          if (v === o) {
            return
          }

          if (v) {
            round.freeRooms.push(room)
          } else {
            ropts = room.rounds[round.id]

            if (ropts != null && ropts.ballot) {
              ropts.ballot.room = null
              ropts.ballot = null
            } else {
              Util.arrayRemove(round.freeRooms, room)
            }
          }

          return
        })
      })((room))
    }

    $scope.addAllTeams = function () {
      return (() => {
        for (var team of $scope.tournament.teams) {
          team.rounds[round.id].participates = true
        }
      })()
    }

    $scope.removeAllTeams = function () {
      return (() => {
        for (var team of $scope.tournament.teams) {
          team.rounds[round.id].participates = false
        }
      })()
    }

    $scope.addAllJudges = function () {
      return (() => {
        for (var judge of $scope.tournament.judges) {
          var ropts = judge.rounds[round.id]

          if (ropts.ballot != null && ropts.ballot.locked) {
            continue
          }

          ropts.participates = true
        }
      })()
    }

    $scope.removeAllJudges = function () {
      return (() => {
        for (var judge of $scope.tournament.judges) {
          var ropts = judge.rounds[round.id]

          if (ropts.ballot != null && ropts.ballot.locked) {
            continue
          }

          ropts.participates = false
        }
      })()
    }

    $scope.removeShadows = function () {
      return (() => {
        var ropts

        for (var judge of $scope.tournament.judges) {
          if (judge.rank === Judge.shadowRank) {
            ropts = judge.rounds[round.id]

            if (ropts.ballot != null && ropts.ballot.locked) {
              continue
            }

            ropts.participates = false
          }
        }
      })()
    }

    $scope.addAllRooms = function () {
      return (() => {
        for (var room of $scope.tournament.rooms) {
          room.rounds[round.id].participates = true
        }
      })()
    }

    $scope.removeAllRooms = function () {
      return (() => {
        for (var room of $scope.tournament.rooms) {
          room.rounds[round.id].participates = false
        }
      })()
    }

    $scope.sortByRank = function () {
      return round.sortByRank(round.teams)
    }

    $scope.shuffle = function () {
      return round.shuffle()
    }

    $scope.shuffleRooms = function () {
      return round.shuffleRooms()
    }

    $scope.sortBallots = function () {
      return round.sortBallots()
    }

    $scope.judgeUd = function (ballot, shadow) {
      return {
        ballot: ballot,
        shadow: shadow
      }
    }

    $scope.elementToString = function (element) {
      var msg
      var addJud
      var first
      var r
      var ballot
      var idx

      if (element.hasClass('judges-cell')) {
        idx = parseInt(element.data('index'))

        if (isNaN(idx)) {
          return null
        }

        ballot = round.ballots[idx]

        if (!(ballot.teams[0] != null) || !(ballot.teams[1] != null)) {
          return ''
        }

        r = ''
        first = true

        addJud = function (j, shadow) {
          if (first) {
            first = false
          } else {
            r += ', '
          }

          r += j.name

          if (shadow) {
            return r += ' (Shd)'
          }
        }

        for (var j of ballot.judges) {
          addJud(j, false)
        }

        for (var j of ballot.shadows) {
          addJud(j, true)
        }

        return r
      }

      if (element.hasClass('win-cell')) {
        idx = parseInt(element.data('index'))

        if (isNaN(idx)) {
          return null
        }

        ballot = round.ballots[idx]
        msg = ballot.stats.scores[0]

        if (msg === 'default win') {
          return 'default ' + ballot.stats.classes[0] + ' win'
        }

        if (msg === 'unfilled') {
          return ''
        }

        if (ballot.stats.scores[1]) {
          return ballot.stats.scores[0] + ' - ' + ballot.stats.scores[1] + ' (' + ballot.stats.winClass + ')'
        }

        return ballot.stats.scores[0]
      }

      return null
    }

    $scope.judgeGroupTest = function (fromList, toList) {
      var ballot = toList.ud.ballot

      if (!(ballot != null)) {
        return true
      }

      if (fromList === toList) {
        return true
      }

      if (ballot.locked || !ballot.teams[0] || !ballot.teams[1]) {
        return false
      }

      return toList.ud.shadow || ballot.judges.length < round.ballotsPerMatchSolved()
    }

    $scope.judgeGroupReplaceTest = function (fromList, toList) {
      var ballot = toList.ud.ballot

      if (!(ballot != null)) {
        return true
      }

      if (fromList === toList) {
        return true
      }

      if (ballot.locked || !ballot.teams[0] || !ballot.teams[1]) {
        return false
      }

      return true
    }

    $scope.isCompatible = function (ballot, judge) {
      return round.judgeRules.isCompatible(judge, ballot, $scope.tournament.judgeRules)
    }

    var updateCAMode = function () {
      $scope.showConflicts = round.caMode && round.showConflicts
      $scope.showRanks = round.caMode && round.showRanks
      return $scope.showShadowConflicts = round.caMode && round.showShadowConflicts
    }

    $scope.$watch('round.caMode', updateCAMode)
    $scope.$watch('round.showConflicts', updateCAMode)
    $scope.$watch('round.showShadowConflicts', updateCAMode)
    $scope.$watch('round.showRanks', updateCAMode)

    $scope.judgeMove = function (fromList, fromIndex, toList, toIndex) {
      if (fromList === toList && toIndex > fromIndex) {
        toIndex--
      }

      var el = fromList.model.splice(fromIndex, 1)[0]
      toList.model.splice(toIndex, 0, el)
      var opts = el.rounds[round.id]
      opts.ballot = toList.ud.ballot
      return opts.shadow = toList.ud.shadow
    }

    $scope.judgeReplace = function (fromList, fromIndex, toList, toIndex) {
      var a = fromList.model[fromIndex]
      b = toList.model[toIndex]
      fromList.model[fromIndex] = b
      toList.model[toIndex] = a
      var opts = a.rounds[round.id]
      opts.ballot = toList.ud.ballot
      opts.shadow = toList.ud.shadow
      opts = b.rounds[round.id]
      opts.ballot = fromList.ud.ballot
      return opts.shadow = fromList.ud.shadow
    }

    $scope.roomMove = function (fromList, fromIndex, toList, toIndex) {
      var ropts

      if (toList.ud) {
        return
      }

      room = fromList.model[fromIndex]

      if (fromList.ud) {
        fromList.model[0] = null
        fromList.ud.room = null
        ropts = room.rounds[round.id]

        if (ropts != null) {
          ropts.ballot = null
        }
      } else {
        if (fromIndex < toIndex) {
          toIndex--
        }

        round.freeRooms.splice(fromIndex, 1)
      }

      return round.freeRooms.splice(toIndex, 0, room)
    }

    $scope.roomReplace = function (fromList, fromIndex, toList, toIndex) {
      var room1 = fromList.model[fromIndex]
      var room2 = toList.model[toIndex]
      fromList.model[fromIndex] = room2
      toList.model[toIndex] = room1

      if (fromList.ud != null) {
        fromList.ud.room = room2
      } else if (!(room2 != null)) {
        fromList.model.splice(fromIndex, 1)
      }

      if (toList.ud != null) {
        toList.ud.room = room1
      } else if (!(room1 != null)) {
        toList.model.splice(toIndex, 1)
      }

      var ro1 = (() => {
        if (room1 != null) {
          return room1.rounds[round.id]
        } else {
          return null
        }
      })()

      var ro2 = (() => {
        if (room2 != null) {
          return room2.rounds[round.id]
        } else {
          return null
        }
      })()

      if (ro1 != null) {
        ro1.ballot = toList.ud
      }

      if (ro2 != null) {
        return ro2.ballot = fromList.ud
      }
    }

    $scope.judgeDragStart = function (jud) {
      var v
      $scope.compatList = v = []

      return (() => {
        for (var b of round.ballots) {
          v.push($scope.isCompatible(b, jud))
        }
      })()
    }

    $scope.judgeDragEnd = function () {
      return $scope.compatList = null
    }

    var updateDecimals = function (scores) {
      var max
      var d;
      ($scope.scoreDecimals != null ? $scope.scoreDecimals : $scope.scoreDecimals = 0)
      var sd = $scope.scoreDecimals

      var maxScoreDec = function (s) {
        var d1 = Util.decimalsOf(s[0], 2)
        var d2 = Util.decimalsOf(s[1], 2)
        return (d2 > d1 ? d2 : d1)
      }

      var shouldUpdate = true
      var shouldSearch = true

      if (scores) {
        d = maxScoreDec(scores)

        if (d === sd) {
          shouldUpdate = false
          shouldSearch = false
        } else if (d > sd) {
          $scope.scoreDecimals = sd = d
          shouldSearch = false
        }
      }

      if (shouldSearch) {
        max = 0

        for (var ballot of round.ballots) {
          var rs = ballot.stats.rawScores

          if (!(rs != null)) {
            continue
          }

          d = maxScoreDec(rs)

          if (d > max) {
            max = d
          }
        }

        if (sd === max) {
          shouldUpdate = false
        } else {
          $scope.scoreDecimals = sd = max
        }
      }

      if (shouldUpdate) {
        return (() => {
          for (var ballot of round.ballots) {
            var st = ballot.stats

            if (!(st.rawScores != null)) {
              continue
            }

            st.scores = [st.rawScores[0].toFixed(sd), st.rawScores[1].toFixed(sd)]
          }
        })()
      }
    }

    var updateStats = function (ballot, dec = true) {
      var dc
      var w
      var s
      var pres0 = ballot.teams[0] != null && ballot.presence[0]
      var pres1 = ballot.teams[1] != null && ballot.presence[1]

      if (!pres0 && !pres1) {
        ballot.stats = {
          scores: ['not played', ''],
          winClass: 'hidden-true',
          classes: ['', 'hidden-true']
        }
      } else if (!pres0 || !pres1) {
        ballot.stats = {
          scores: ['default win', ''],
          winClass: 'hidden-true',
          classes: [((pres0 ? 'prop' : 'opp')), 'hidden-true']
        }
      } else if (ballot.locked) {
        s = [0, 0]
        w = [0, 0]

        for (var side of [0, 1]) {
          var ballots = 0

          for (var vote of ballot.votes) {
            for (var i of [0, 1, 2, 3]) {
              s[side] += vote.scores[side][i] * vote.ballots
            }

            w[side] += (side ? vote.opp : vote.prop)
            ballots += vote.ballots
          }

          s[side] /= ballots
        }

        dc = $scope.scoreDecimals

        ballot.stats = {
          scores: [s[0].toFixed(dc), s[1].toFixed(dc)],
          rawScores: s,
          winClass: (w[0] > w[1] ? 'prop' : 'opp'),
          classes: ['', '']
        }

        if (dec) {
          updateDecimals(s)
        }
      } else {
        ballot.stats = {
          scores: ['unfilled', ''],
          winClass: 'hidden-true',
          classes: ['muted-true', '']
        }
      }

      return
    }

    for (var b of round.ballots) {
      updateStats(b, false)
    }

    updateDecimals()

    $scope.assignJudges = function () {
      return round.assignJudges()
    }

    $scope.assignRooms = function () {
      return round.assignRooms()
    }

    $scope.pair = function () {
      $scope.pairOpts = {
        algorithm: 0,
        sides: 0,
        manualSides: true,
        shuffleRooms: true,
        noClubMatches: true,
        hardSides: true,
        minimizeReMeet: true,
        matchesPerBracket: round.tournament.matchesPerBracket,
        evenBrackets: round.tournament.evenBrackets
      }

      var prev = $scope.prevRounds = round.previousRounds()
      $scope.pairAlgorithms = (prev.length ? Round.allAlgos : Round.initialAlgos)
      $scope.algoName = Round.algoName
      $scope.pairingTeams = round.pairingTeams()
      $scope.manualPairing = []
      var v = $scope.sides = [0, 1]

      for (var r of prev) {
        var name = r.getName()

        v.push({
          roundId: r.id,
          name: 'Same as ' + name,
          flip: false
        })

        v.push({
          roundId: r.id,
          name: 'Opposite from ' + name,
          flip: true
        })
      }

      $scope.sidesName = function (s) {
        if (s === 0) {
          return 'Random'
        }

        if (s === 1) {
          return 'Balanced'
        }

        return s.name
      }

      return new AlertController({
        buttons: ['Cancel', 'Ok'],
        cancelButtonIndex: 0,
        title: 'Round ' + (index + 1) + ' pairing',
        htmlMessage: $compile(templatePairModal())($scope),

        onClick: function (alert, button) {
          var opts

          if (button === 1) {
            opts = $scope.pairOpts

            if (opts.algorithm === 1) {
              if ($scope.pairingTeams.length) {
                alert.find('.error-placeholder').html(templateErrorAlert({
                  error: 'You must pair all the teams before continuing'
                }))

                return
              }

              opts.manualPairing = $scope.manualPairing
            }

            alert.modal('hide')

            return Util.safeApply($scope, function () {
              round.pair(opts)

              return (() => {
                for (var b of round.ballots) {
                  updateStats(b)
                }
              })()
            })
          }
        }
      })
    }

    $scope.addTeamToManualPairing = function (team, index) {
      var div
      var p

      if ($scope.incompletePairing) {
        p = $scope.incompletePairing
        $scope.incompletePairing = null

        if (!p.prop) {
          p.prop = team
        } else if (!p.opp) {
          p.opp = team
        } else {
          return
        }
      } else {
        p = $scope.incompletePairing = {
          prop: team
        }

        $scope.manualPairing.push(p)
        div = $('.manual-pairings .col-sm-8')

        div.animate({
          scrollTop: div[0].scrollHeight
        }, 500)
      }

      return $scope.pairingTeams.splice(index, 1)
    }

    $scope.removePairFromManualPairing = function (pair, index) {
      if (pair.prop) {
        if (pair.opp) {
          $scope.pairingTeams.splice(0, 0, pair.prop, pair.opp)
        } else {
          $scope.pairingTeams.splice(0, 0, pair.prop)
        }
      } else {
        $scope.pairingTeams.splice(0, 0, pair.opp)
      }

      $scope.manualPairing.splice(index, 1)

      if (pair === $scope.incompletePairing) {
        return $scope.incompletePairing = null
      }
    }

    $scope.reverseSidesInManualPairing = function (pairing) {
      var p = pairing.prop
      pairing.prop = pairing.opp
      return pairing.opp = p
    }

    return $scope.editBallot = function (index) {
      var total
      var avgReply
      var avgCons
      var sc = $scope.$parent.$new()
      $(document).unbind('keydown keypress', enterForSelection)
      Util.installScopeUtils(sc)
      $scope.disableDigest()
      var ballot = round.ballots[index]

      if (!(ballot.teams[0] != null) || !(ballot.teams[1] != null)) {
        return
      }

      var noBallots = round.ballotsPerMatchSolved()
      sc.votes = ballot.getVotesForBallots(noBallots)
      sc.speakers = [ballot.teams[0].players, ballot.teams[1].players]
      var n = sc.votes.length
      var tournament = $scope.tournament

      sc.validateScore = function (role, score) {
        var max
        var min

        if (role === 3) {
          min = tournament.minReplyScore
          max = tournament.maxReplyScore
        } else {
          min = tournament.minConstructiveScore
          max = tournament.maxConstructiveScore
        }

        return sc.validateMinMax(score, min, max)
      }

      sc.scoreWarning = function (role, score) {
        var margin
        var max
        var min

        if (role === 3) {
          min = tournament.minReplyScore
          max = tournament.maxReplyScore
          margin = 0.5
        } else {
          min = tournament.minConstructiveScore
          max = tournament.maxConstructiveScore
          margin = 1
        }

        return score <= min + margin || score >= max - margin
      }

      sc.parseScoreEntry = function (role, score) {
        var max
        var min
        var r
        var orig = r = parseFloat(score)

        if (role === 3) {
          min = tournament.minReplyScore
          max = tournament.maxReplyScore
        } else {
          min = tournament.minConstructiveScore
          max = tournament.maxConstructiveScore
        }

        while (r > max) {
          r /= 10
        }

        if (r < min) {
          return orig
        }

        return r
      }

      sc.winner = function (vote) {
        return (vote.prop > vote.opp ? 'prop' : 'opp')
      }

      sc.roles = ballot.getSpeakerRoles()
      sc.presence = [ballot.presence[0], ballot.presence[1]]
      sc.sides = ['Prop', 'Opp']
      sc.sidesClass = ['prop', 'opp']

      sc.validPlayer = function (el, v) {
        var c = 0

        for (var i of [0, 1, 2]) {
          if (v[i] === el) {
            c++
          }
        }

        return c
      }

      var splitsForBallots = function (nb) {
        return [_.range((nb / 2 >> 0) + 1, nb + 1), _.range((nb / 2 >> 0) + (nb & 1))]
      }

      noBallots = 0

      for (var i of (function () {
        var results = []

        for (var i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i++ : i--)) {
          results.push(i)
        }

        return results
      }).apply(this)) {
        (function (i) {
          var vote = sc.votes[i]
          var nb = vote.ballots
          noBallots += nb

          if (!vote.judge && !ballot.locked) {
            sc.noJudgesWarning = true
          }

          vote.aux = {
            decisionValid: true,
            validSplits: splitsForBallots(nb),
            winner: 0
          }

          sc.$watch((function () {
            return vote.prop
          }), function (v) {
            return vote.opp = vote.ballots - vote.prop
          })

          sc.$watch((function () {
            return vote.opp
          }), function (v) {
            return vote.prop = vote.ballots - vote.opp
          })

          return sc.$watch((function () {
            return pointsWinner(vote)
          }), function (v) {
            var loss
            var win
            vote.aux.decisionValid = true

            if (vote.prop > vote.opp) {
              win = vote.prop
              loss = vote.opp
            } else {
              win = vote.opp
              loss = vote.prop
            }

            if (v === 0) {
              vote.prop = win
              vote.opp = loss
              return vote.aux.winner = 0
            } else if (v === 1) {
              vote.prop = loss
              vote.opp = win
              return vote.aux.winner = 1
            } else {
              return vote.aux.decisionValid = false
            }
          })
        })(i)
      }

      sc.lockJudgesInfo = !ballot.locked && !sc.noJudgesWarning

      if (n > 1) {
        avgCons = (tournament.minConstructiveScore + tournament.maxConstructiveScore) / 2
        avgReply = (tournament.minReplyScore + tournament.maxReplyScore) / 2

        sc.votes.push(total = {
          judge: {
            name: 'Total'
          },

          scores: [
            [avgCons, avgCons, avgCons, avgReply],
            [avgCons, avgCons, avgCons, avgReply]
          ],

          total: true,

          aux: {
            decisionValid: true,
            validSplits: splitsForBallots(noBallots),
            winner: 0
          }
        })

        for (var i of [0, 1]) {
          for (var j of [0, 1, 2, 3]) {
            (function (i, j) {
              return sc.$watch(function () {
                var s = 0

                for (var vote of sc.votes) {
                  if (!vote.total) {
                    s += vote.scores[i][j] * vote.ballots
                  }
                }

                return s / noBallots
              }, function (v) {
                return total.scores[i][j] = v
              })
            })(i, j)
          }
        }

        sc.$watch(function () {
          var s = 0

          for (var vote of sc.votes) {
            if (!vote.total) {
              s += vote.prop
            }
          }

          return s
        }, function (v) {
          return total.prop = v
        })

        sc.$watch(function () {
          var s = 0

          for (var vote of sc.votes) {
            if (!vote.total) {
              s += vote.opp
            }
          }

          return s
        }, function (v) {
          return total.opp = v
        })

        sc.$watch(function () {
          for (var k of (function () {
            var results1 = []

            for (var j = 0; (0 <= n ? j < n : j > n); (0 <= n ? j++ : j--)) {
              results1.push(j)
            }

            return results1
          }).apply(this)) {
            if (!sc.votes[k].aux.decisionValid) {
              return false
            }
          }

          return true
        }, function (v) {
          return sc.votes[n].aux.decisionValid = v
        })
      }

      var pointsWinner = function (vote) {
        var scp = vote.scores[0]
        var sco = vote.scores[1]
        var tp = scp[0] + scp[1] + scp[2] + scp[3]
        var to = sco[0] + sco[1] + sco[2] + sco[3]

        if (tp > to) {
          return 0
        } else if (tp < to) {
          return 1
        } else {
          return 2
        }
      }

      var rx = /INPUT|TEXTAREA/i
      var _alert = null

      var preventBack = function (e) {
        if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
          if (e.which === 8) {
            e.preventDefault()
          }

          if (e.which === 27) {
            _alert.modal('hide')
            _alert = null
            return e.preventDefault()
          }
        }
      }

      return new AlertController({
        buttons: ['Cancel', 'Ok'],
        cancelButtonIndex: 0,
        width: 760,
        title: '<span class="prop">' + ballot.teams[0].name + '</span><span> vs. </span><span class="opp">' + ballot.teams[1].name + '</span>',
        htmlMessage: $compile(templateBallotSheet())(sc),
        animated: false,
        tabIndex: [1],

        onShown: function (alert) {
          $(document).bind('keydown keypress', preventBack)
          _alert = alert

          alert.keypress(function (e) {
            if (e.which === 8) {
              return e.stopPropagation()
            }
          })

          return setTimeout((function () {
            return alert.find('#roles-table tr:first-child td:nth-child(2) .multi-label').focus()
          }), 1)
        },

        onClick: function (alert, button) {
          sc.$apply(function () {
            sc.drawsError = false
            return sc.outOfRangeError = false
          })

          var voteError = false
          var pres = sc.presence[0] && sc.presence[1]

          if (button === 1) {
            for (var vote of sc.votes) {
              if (vote.total) {
                continue
              }

              for (var i of [0, 1]) {
                for (var j of [0, 1, 2]) {
                  var nr = vote.scores[i][j]

                  if (nr < tournament.minConstructiveScore || nr > tournament.maxConstructiveScore) {
                    voteError = true

                    if (pres) {
                      sc.$apply(function () {
                        return sc.outOfRangeError = true
                      })

                      return
                    }
                  }
                }

                nr = vote.scores[i][3]

                if (nr < tournament.minReplyScore || nr > tournament.maxReplyScore) {
                  voteError = true

                  if (pres) {
                    sc.$apply(function () {
                      return sc.outOfRangeError = true
                    })

                    return
                  }
                }
              }

              if (!vote.aux.decisionValid) {
                voteError = true

                if (pres) {
                  sc.$apply(function () {
                    return sc.drawsError = true
                  })

                  return
                }
              }
            }

            if (!voteError) {
              ballot.votes = _.filter(sc.votes, function (x) {
                return !x.total
              })
            }

            ballot.roles = [sc.roles[0].roles, sc.roles[1].roles]
            ballot.presence = [sc.presence[0], sc.presence[1]]
            sc.$destroy()
            sc = null
            $scope.enableDigest()

            for (var vote of ballot.votes) {
              delete vote.aux
            }

            ballot.locked = true

            $scope.$apply(function () {
              return updateStats(ballot)
            })

            return alert.modal('hide')
          }
        },

        onDismissed: function (alert) {
          if (sc != null) {
            sc.$destroy()
          }

          _alert = null
          $(document).unbind('keydown keypress', preventBack)
          return $(document).bind('keydown keypress', enterForSelection)
        }
      })
    }
  }
])

ngModule.controller(
  'SidebarRemoveRound',
  ['$scope', '$element', '$location', function ($scope, $element, $location) {
    return $scope.removeRound = function () {
      var i = $scope.$index

      return new AlertController({
        buttons: ['Cancel', 'Delete'],
        cancelButtonIndex: 0,
        primaryButtonIndex: 1,
        title: 'Delete Round ' + (i + 1),
        width: 400,
        htmlMessage: '<p>Are you sure you want to delete Round ' + (i + 1) + '?</p><p>This will remove the pairing, all ballots and all scores associated with this round. Most mistakes can be corrected without deleting the whole round.</p>',

        onClick: (alert, bIndex, bName) => {
          if (bIndex === 1) {
            return $scope.$apply(() => {
              if ($location.path().match(/^\/round/)) {
                $location.path('/')
              }

              var t = $scope.tournament
              var r = t.rounds[i]
              t.rounds.splice(i, 1)
              r.destroy()
              return alert.modal('hide')
            })
          }
        }
      })
    }
  }]
)

ngModule.controller('SidebarNewRound', ['$scope', function ($scope) {
  return $scope.addRound = function () {
    var tournament = $scope.tournament
    return tournament.rounds.push(new Round(tournament))
  }
}])

class Rounds {
  angularModules () {
    return ['rounds']
  }

  sidebarCategory () {
    return 'Rounds'
  }

  sidebarItem () {
    return {
      html: templateRoundsSidebar()
    }
  }

  route () {
    return '/rounds/:roundIndex'
  }

  routeOpts () {
    return {
      template: templateView(),
      controller: 'RoundController'
    }
  }
}

module.exports = Rounds
