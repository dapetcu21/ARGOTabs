define ['util'], (Util) ->
  class Team
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""

    unpackCycles: ->
      @club = Util.unpackCycle @club, @tournament.clubs
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.club = Util.packCycle @club, @tournament.clubs
      return model
