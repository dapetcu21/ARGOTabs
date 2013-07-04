define ['util'], (Util) ->
  class Ballot
    constructor: (@round, other) ->
      if other
        for key, value of other
          this[key] = value
      @prop ?= null
      @opp ?= null

    unpackCycles: ->
      @prop = Util.unpackCycle @prop, @round.tournament.teams
      @opp = Util.unpackCycle @opp, @round.tournament.teams
    
    toJSON: ->
      model = Util.copyObject this, ['round']
      model.prop = Util.packCycle @prop, @round.tournament.teams
      model.opp = Util.packCycle @opp, @round.tournament.teams
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
