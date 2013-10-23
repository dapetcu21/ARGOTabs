define ['util', 'ballot', 'judge', 'sorter', 'team', 'underscore'], (Util, Ballot, Judge, Sorter, Team) ->
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
      @ballotsPerMatch ?= null
      @maxMainJudges ?= null
      @maxShadowJudges ?= null
      @maxPanelSize ?= null
      @inheritPairRank ?= true
      @pairRankSorter = Sorter.teamRankSorter @pairRankSorter
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

    ballotsPerMatchSolved: -> if @ballotsPerMatch? then @ballotsPerMatch else @tournament.ballotsPerMatch
    maxMainJudgesSolved: -> if @maxMainJudges? then @maxMainJudges else @tournament.maxMainJudges
    maxShadowJudgesSolved: -> if @maxShadowJudges? then @maxShadowJudges else @tournament.maxShadowJudges
    maxPanelSizeSolved: -> if @maxPanelSize? then @maxPanelSize else @tournament.maxPanelSize
    pairRankSorterSolved: -> if @pairRankSorter? then @pairRankSorter else @tournament.pairRankSorter

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
      Team.calculateStats array, @previousRounds()
      sorter = @pairRankSorterSolved().compareObjects
      array.sort (a,b) -> sorter a.stats, b.stats

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
      roomsIdx = 0
      roomsL = rooms.length

      flip = opts.shuffleSides || opts.algorithm != 1
      balance = opts.balanceSides
      balance ?= true

      pairTeams = (a, b, skillIndex = 0) =>
        ballot = new Ballot this
        ballot.teams[0] = a
        ballot.teams[1] = b
        ballot.skillIndex = skillIndex
        if not a? or not b?
          if not a?
            aux = a
            a = b
            b = aux
            ballot.teams[0] = a
            ballot.teams[1] = b
          ballot.locked = true
        else
          if flip
            proportion = 0.5
            #if balance
              #weighted coin flip
            if Math.random() > proportion
              ballot.teams[0] = b
              ballot.teams[1] = a
        ballot.room = rooms[roomsIdx] if roomsIdx < roomsL
        roomsIdx++
        @ballots.push ballot
        a.rounds[id].ballot = ballot if a?
        b.rounds[id].ballot = ballot if b?

      skillIndex = 0
      switch opts.algorithm
        when 0 #random
          for i in [0...teams.length] by 2
            pairTeams teams[i], teams[i+1]
        when 1 #manual
          for o in opts.manualPairing
            pairTeams o.prop, o.opp
        when 3 #high-high
          for i in [0...teams.length] by 2
            pairTeams teams[i], teams[i+1], skillIndex++
      @paired = true

      if opts.shuffleRooms
        @shuffleRooms()

      @assignJudges()

    assignJudges: ->
      id = @id
      judges = _.shuffle _.filter @judges, (o) -> o.rounds[id].participates && o.rank != Judge.shadowRank
      judges.sort (a,b) -> a.rank < b.rank
      shadowJudges = _.shuffle _.filter @judges, (o) -> o.rounds[id].participates && o.rank == Judge.shadowRank
      ballots = _.sortBy _.shuffle _.filter @ballots, ((o)-> o.teams[0] && o.teams[1]), (o) -> o.skillIndex

      for b in ballots
        b.judges = []
        b.shadows = []

      noBallots = ballots.length
      noJudges = judges.length

      if noJudges < noBallots
        split = noBallots - noJudges
        if shadowJudges.length < split
          split = shadowJudges.length
        for i in [0...split]
          judges.push shadowJudges[i]
        shadowJudges.splice 0, split

      ballotPerMatch = @ballotsPerMatchSolved()
      panelSize = @maxPanelSizeSolved()
      maxShadows = @maxShadowJudgesSolved()
      maxJudges = @maxMainJudgesSolved()

      #to be changed
      i = 0
      for j in judges
        ballot = ballots[i]
        jc = ballot.judges.length
        sc = ballot.shadows.length
        continue if jc + sc >= panelSize
        if jc < ballotPerMatch && jc < maxJudges
          ballot.judges.push j
        else if sc < maxShadows
          ballot.shadows.push j
        i = 0 if ++i >= noBallots

      for j in shadowJudges
        ballot = ballots[i]
        jc = ballot.judges.length
        sc = ballot.shadows.length
        if jc + sc < panelSize && sc < maxShadows
          ballot.shadows.push j
        i = 0 if ++i >= noBallots

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
