define ['util'], (Util) ->
  class Ballot
    constructor: (@round, other) ->
      if other
        for key, value of other
          this[key] = value
      @prop ?= null
      @opp ?= null
      @room ?= null

    unpackCycles: ->
      @prop = Util.unpackCycle @prop, @round.tournament.teams
      @opp = Util.unpackCycle @opp, @round.tournament.teams
      @room = Util.unpackCycle @room, @round.tournament.rooms
    
    toJSON: ->
      model = Util.copyObject this, ['round']
      model.prop = Util.packCycle @prop, @round.tournament.teams
      model.opp = Util.packCycle @opp, @round.tournament.teams
      model.room = Util.packCycle @room, @round.tournament.rooms
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
