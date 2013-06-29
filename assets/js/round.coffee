define ['util', 'underscore'], (Util, _) ->
  class Round
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @id ?= Math.floor(Math.random() * 100000000)
      @tableOpts ?= {}
      @judges ?= []
      @teams ?= []
      if not other
        for team in @tournament.teams
          @registerTeam team
        for judge in @tournament.judges
          @registerJudge judge

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams
      Util.unpackCycles @judges, @tournament.judges

    registerJudge: (judge) ->
      id = @id
      if not judge.rounds[id]?
        judge.rounds[id] =
          participates: true
          locked: false
        @judges.push judge

    unregisterJudge: (judge) ->
      idx = @judges.indexOf judge
      if idx != -1
        @judges.splice idx, 1

    registerTeam: (team) ->
      id = @id
      if not team.rounds[id]?
        team.rounds[id] =
          participates: true
          locked: false
        @teams.push team
        
    unregisterTeam: (team) ->
      idx = @teams.indexOf team
      if idx != -1
        @teams.splice idx, 1
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.teams = Util.packCycles @teams, @tournament.teams
      model.judges = Util.packCycles @judges, @tournament.judges
      return model

    destroy: ->
      id = @id
      for team in @tournament.teams
        delete team.rounds[id]
      for judge in @tournament.judges
        delete judge.rounds[id]
