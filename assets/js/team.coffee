define ['util', 'player'], (Util, Player) ->
  class Team
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @players ?= []
      @rounds ?= {}
      if not other
        for round in @tournament.rounds
          round.registerTeam this

    unpackCycles: ->
      @club = Util.unpackCycle @club, @tournament.clubs
      Util.unpackCycles @players, @tournament.players
      for id, opts in @rounds
        round = @tournament.rounds[id]
        if round and opts.ballot
          opts.ballot = Util.unpackCycle opts.ballot, round.ballots
    
    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.club = Util.packCycle @club, @tournament.clubs
      model.players = Util.packCycles @players, @tournament.players
      for id, opts in @rounds
        round = @tournament.rounds[id]
        if round and opts.ballot
          opts.ballot = Util.packCycle opts.ballot, round.ballots
      return model

    addPlayer: ->
      pl = new Player @tournament
      @players.push pl
      @tournament.players.push pl
      pl.team = this

    removePlayer: (player) ->
      idx = @players.indexOf player
      @players.splice idx, 1

    removePlayerAtIndex: (index) ->
      player = @players[index]
      @players.splice index, 1
      arr = @tournament.players
      idx = arr.indexOf player
      arr.splice idx, 1

    destroy: ->
      for round in @tournament.rounds
        round.unregisterTeam this
      if @club
        @club.removeTeam(this)
