define ['util'], (Util)->
  class Club
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @teams ?= []

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.teams = Util.packCycles @teams, @tournament.teams
      return model

    removeTeam: (team) ->
      index = @teams.indexOf team
      if index != -1
        @teams.splice(index, 1)
    addTeam: (team) ->
      @teams.push team
