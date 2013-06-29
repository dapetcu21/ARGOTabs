define ['util'], (Util) ->
  class Judge
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @rank ?= 0
      @rounds ?= {}
      if not other
        for round in @tournament.rounds
          round.registerJudge this

    unpackCycles: ->
      @club = Util.unpackCycle @club, @tournament.clubs
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.club = Util.packCycle @club, @tournament.clubs
      return model

    destroy: ->
      for round in @tournament.rounds
        round.unregisterJudge this
      if @club
        @club.removeJudge(this)
