define ['util', 'ballot', 'underscore'], (Util, Ballot) ->
  class Round
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @id ?= Math.floor(Math.random() * 100000000)
      @tableOpts ?= {}
      @judges ?= []
      @teams ?= []
      @rooms ?= []
      @ballots ?= []
      @rankFrom ?= {all:true}
      if other
        for ballot, i in @ballots
          @ballots[i] = new Ballot this, ballot
      else
        for team in @tournament.teams
          @registerTeam team
        for judge in @tournament.judges
          @registerJudge judge
        for room in @tournament.rooms
          @registerRoom room

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams
      Util.unpackCycles @judges, @tournament.judges
      Util.unpackCycles @rooms, @tournament.rooms
      for ballot in @ballots
        ballot.unpackCycles()

    previousRounds: ->
      r = []
      if @rankFrom.all
        for round in @tournament.rounds
          break if round == this
          if round.paired
            r.push round
      else
        for round in @tournament.rounds
          if round.paired and @rankFrom[round.id]
            r.push round
      return r

    registerJudge: (judge) ->
      id = @id
      if not judge.rounds[id]?
        judge.rounds[id] =
          participates: true
          locked: false
        @judges.push judge

    unregisterJudge: (judge) ->
      idx = @judges.indexOf judge
      if idx != -1
        @judges.splice idx, 1

    registerTeam: (team) ->
      id = @id
      if not team.rounds[id]?
        team.rounds[id] =
          participates: true
          locked: false
        @teams.push team
        
    unregisterTeam: (team) ->
      idx = @teams.indexOf team
      if idx != -1
        @teams.splice idx, 1

    registerRoom: (room) ->
      id = @id
      if not room.rounds[id]?
        room.rounds[id] =
          participates: true
          locked: false
        @rooms.push room

    unregisterRoom: (room) ->
      idx = @rooms.indexOf room
      if idx != -1
        @rooms.splice idx, 1
    
    sortByRank: (array) ->
      console.log "sorting by rank: ", array

    pairingTeams: ->
      id = @id
      teams = _.filter @teams, (o) -> o.rounds[id].participates

    pair: (opts) ->
      teams = @pairingTeams()
      
      if opts.algorithm
        @sortByRank teams
      else
        teams = _.shuffle teams
      if teams.length & 1
        teams.push null


      id = @id
      rooms = _.filter @rooms, (o) -> o.rounds[id].participates
      console.log rooms
      roomsIdx = 0
      roomsL = rooms.length

      pairTeams = (a, b, balance = true) =>
        ballot = new Ballot this
        ballot.prop = a
        ballot.opp = b
        ballot.room = rooms[roomsIdx] if roomsIdx < roomsL
        roomsIdx++
        @ballots.push ballot

      switch opts.algorithm
        when 0, 3
          for i in [0...teams.length] by 2
            pairTeams teams[i], teams[i+1], opts.balance

      @paired = true

    shuffleRooms: ->
      ballots = _.shuffle @ballots
      rooms = _.map @ballots, (o) -> o.room
      for ballot,i in ballots
        ballot.room = rooms[i]
        @ballots[i] = ballot

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.teams = Util.packCycles @teams, @tournament.teams
      model.judges = Util.packCycles @judges, @tournament.judges
      model.rooms = Util.packCycles @rooms, @tournament.rooms
      return model

    destroy: ->
      id = @id
      for team in @tournament.teams
        delete team.rounds[id]
      for judge in @tournament.judges
        delete judge.rounds[id]
      for room in @tournament.rooms
        delete room.rounds[id]

    @allAlgos = [0, 1, 2, 3]
    @initialAlgos = [0, 1]
    @algoName = ['Random', 'Manual', 'High-Low', 'Power Pairing']
