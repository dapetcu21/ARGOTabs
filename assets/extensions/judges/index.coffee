define ['models/judge'], (Judge) ->
  class Judges
    constructor: (@ui) ->
    sidebarCategory: -> 'Participants'
    sidebarItem: ->
      name: 'Judges'
      sortToken: 3
    route: -> '/judges'
    routeOpts: ->
      ui = @ui
      result =
        templateUrl: 'partials/judges.html'
        controller: [ '$scope', ($scope) ->
          $scope.ranks = Judge.ranks
          $scope.rankStrings = Judge.rankStrings

          $scope.addJudge = ->
            tournament = ui.tournament
            judge = new Judge tournament
            tournament.judges.push judge
            
          $scope.removeJudge = (index) ->
            array = ui.tournament.judges
            array[index].destroy()
            array.splice(index, 1)

          $scope.initRepeat = (iScope) ->
            iScope.$watch ->
              iScope.o.club
            , (newValue, oldValue) ->
              return if newValue == oldValue
              judge = iScope.o
              if oldValue
                oldValue.removeJudge(judge)
              if newValue
                newValue.addJudge(judge)

          $scope.canRemoveJudge = (judge) ->
            for round in ui.tournament.rounds
              ropts = judge.rounds[round.id]
              if ropts? and ropts.ballot? and ropts.ballot.locked
                return false
            return true

          $scope.eliminateNil = (a) ->
            if not a?
              return ''
            return a
        ]
