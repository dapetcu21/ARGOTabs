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
      model = Util.copyObject this, ['tournament', 'rounds']
      model.club = Util.packCycle @club, @tournament.clubs
      model.players = Util.packCycles @players, @tournament.players
      model.rounds = {}
      for id, opts in @rounds
        round = @tournament.rounds[id]
        model.rounds[id] = mopts = Util.copyObject opts
        if round and opts.ballot
          mopts.ballot = Util.packCycle opts.ballot, round.ballots
      return model

    getStats: (rounds) ->
      console.log "gettingStats: ", this, rounds
      o =
        score: 0
        scoreHighLow: 0
        ballots: 0
        wins: 0
        roundCount: 0
        byeWins: 0
      for round in rounds
        round = round.id if typeof round == 'object'
        ballot = @rounds[round].ballot
        console.log ballot
      return o

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
