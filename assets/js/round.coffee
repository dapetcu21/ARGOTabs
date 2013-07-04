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
      @rankFrom ?= {all:true}
      if not other
        for team in @tournament.teams
          @registerTeam team
        for judge in @tournament.judges
          @registerJudge judge

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams
      Util.unpackCycles @judges, @tournament.judges

    previousRounds: ->
      r = []
      if @rankFrom.all
        for round in @tournament.rounds
          break if round == this
          if round.paired
            r.push round
      else
        for round in @tournament.rounds
          if round.paired and @rankFrom[round.id]
            r.push round
      return r

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
    
    sortByRank: (array) ->
      console.log "sorting by rank: ", array

    pair: (opts) ->
      console.log 'pair'
      @paired = true

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

    @allAlgos = [0, 1, 2, 3]
    @initialAlgos = [0, 1]
    @algoName = ['Random', 'Manual', 'High-Low', 'Power Pairing']
