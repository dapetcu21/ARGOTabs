define ['util'], (Util)->
  class Room
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @floor ?= ""
      @rounds ?= {}
      if not other
        for round in @tournament.rounds
          round.registerRounds this

    unpackCycles: ->

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      return model

    destroy: ->
      for round in @tournament.rounds
        round.unregisterRoom this
