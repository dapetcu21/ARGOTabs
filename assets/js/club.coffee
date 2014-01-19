define ['util'], (Util)->
  class Club
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @teams ?= []
      @judges ?= []

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams
      Util.unpackCycles @judges, @tournament.judges

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.teams = Util.packCycles @teams, @tournament.teams
      model.judges = Util.packCycles @judges, @tournament.judges
      return model

    removeTeam: (team) ->
      index = @teams.indexOf team
      if index != -1
        @teams.splice(index, 1)
    addTeam: (team) ->
      @teams.push team

    removeJudge: (judge) ->
      index = @judges.indexOf judge
      if index != -1
        @judges.splice(index, 1)
    addJudge: (judge) ->
      @judges.push judge

    destroy: ->
      for team in @teams
        team.club = null
      for judge in @judges
        judge.club = null
      @tournament.destroyEntityInJudgeRules this
