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

    @rankStrings = ['A', 'B', 'C']
    for i in [3..31]
      @rankStrings.push null
    @rankStrings.push 'Shd'

    @ranks = [0, 1, 2, 32]
    @shadowRank = 32

    unpackCycles: ->
      @club = Util.unpackCycle @club, @tournament.clubs
      for round in @tournament.rounds
        opts = @rounds[round.id]
        if opts?
          opts.ballot = Util.unpackCycle opts.ballot, round.ballots
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.club = Util.packCycle @club, @tournament.clubs
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
        round.unregisterJudge this
      if @club
        @club.removeJudge(this)
