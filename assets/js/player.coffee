define ['util'], (Util) ->
  class Player
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= "Unnamed"

    unpackCycles: ->
      @team = Util.unpackCycle @team, @tournament.teams
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.team = Util.packCycle @team, @tournament.teams
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
