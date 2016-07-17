define ['../core/util', './uuid'], (Util, UUID)->
  class Room
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @id ?= UUID 'room_'
      @floor ?= ""
      @rounds ?= {}
      if not other
        for round in @tournament.rounds
          round.registerRoom this

    unpackCycles: ->
      for round in @tournament.rounds
        opts = @rounds[round.id]
        if opts?
          opts.ballot = Util.unpackCycle opts.ballot, round.ballots

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.rounds = {}
      for round in @tournament.rounds
        opts = @rounds[round.id]
        if opts?
          mopts = Util.copyObject opts, []
          mopts.ballot = Util.packCycle mopts.ballot, round.ballots
        model.rounds[round.id] = mopts
      return model

    destroy: ->
      for round in @tournament.rounds
        round.unregisterRoom this
