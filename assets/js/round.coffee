define ['util', 'ballot', 'judge', 'sorter', 'team', 'underscore'], (Util, Ballot, Judge, Sorter, Team) ->
 class Round
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @id ?= Math.floor(Math.random() * 100000000)
      @tableOpts ?= {}
      @teams ?= []
      @judges ?= []
      @freeJudges ?= []
      @rooms ?= []
      @freeRooms ?= []
      @ballots ?= []
      @ballotsPerMatch ?= null
      @maxMainJudges ?= null
      @maxShadowJudges ?= null
      @maxPanelSize ?= null
      @inheritPairRank ?= true
      @allowShadows ?= null
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
          judge.rounds[@id].participates = true
          @freeJudges.push judge
        for room in @tournament.rooms
          @registerRoom room

    ballotsPerMatchSolved: -> if @ballotsPerMatch? then @ballotsPerMatch else @tournament.ballotsPerMatch
    maxMainJudgesSolved: -> if @maxMainJudges? then @maxMainJudges else @tournament.maxMainJudges
    maxShadowJudgesSolved: -> if @maxShadowJudges? then @maxShadowJudages else @tournament.maxShadowJudges
    maxPanelSizeSolved: -> if @maxPanelSize? then @maxPanelSize else @tournament.maxPanelSize
    pairRankSorterSolved: -> if @pairRankSorter? then @pairRankSorter else @tournament.pairRankSorter
    allowShadowsSolved: -> if @allowShadows? then @allowShadows else @tournament.allowShadows

    unpackCycles: ->
      Util.unpackCycles @teams, @tournament.teams
      Util.unpackCycles @judges, @tournament.judges
      Util.unpackCycles @freeJudges, @tournament.judges
      Util.unpackCycles @rooms, @tournament.rooms
      Util.unpackCycles @freeRooms, @tournament.rooms
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
          participates: false
        @judges.push judge

    unregisterJudge: (judge) ->
      ropts = judge.rounds[@id]
      if ropts? and ropts.ballot?
        if ropts.shadow
          Util.arrayRemove ropts.ballot.shadows, judge
        else
          Util.arrayRemove ropts.ballot.judges, judge
      Util.arrayRemove @judges, judge
      Util.arrayRemove @freeJudges, judge

    registerTeam: (team) ->
      id = @id
      if not team.rounds[id]?
        team.rounds[id] =
          participates: true
        @teams.push team
        
    unregisterTeam: (team) ->
      Util.arrayRemove @teams, team

    registerRoom: (room) ->
      id = @id
      if not room.rounds[id]?
        room.rounds[id] =
          participates: true
        @rooms.push room
        @freeRooms.push room

    unregisterRoom: (room) ->
      ropts = room.rounds[@id]
      if ropts? and ropts.ballot?
        ropts.ballot.room = null
      Util.arrayRemove @rooms, room
      Util.arrayRemove @freeRooms, room
    
    sortByRank: (array) ->
      Team.calculateStats array, @previousRounds()
      sorter = @pairRankSorterSolved().boundComparator()
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
      rooms = _.filter @rooms, (o) ->
        ropts = o.rounds[id]
        ropts.ballot = null
        ropts.participates
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
        if roomsIdx < roomsL and not ballot.locked
          ballot.room = rooms[roomsIdx]
          ballot.room.rounds[id].ballot = ballot
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

      rooms.splice 0, roomsIdx
      @freeRooms = rooms
      if opts.shuffleRooms
        @shuffleRooms()

      @assignJudges()

    assignJudges: ->
      id = @id
      ballots = _.sortBy _.shuffle _.filter @ballots, ((o)-> !o.locked && o.teams[0] && o.teams[1]), (o) -> o.skillIndex

      for b in ballots
        for j in b.judges
          j.rounds[id].ballot = null
        for j in b.shadows
          j.rounds[id].ballot = null
        b.judges = []
        b.shadows = []

      judges = _.shuffle _.filter @judges, (o) ->
        ropts = o.rounds[id]
        ropts.participates && !ropts.ballot && o.rank != Judge.shadowRank
      shadowJudges = _.shuffle _.filter @judges, (o) ->
        ropts = o.rounds[id]
        ropts.participates && !ropts.ballot && o.rank == Judge.shadowRank
      @freeJudges = []
      judges.sort (a,b) -> a.rank < b.rank

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

      addJudge = (j, b, sh = false) ->
        if sh
          b.shadows.push j
        else
          b.judges.push j
        ropts = j.rounds[id]
        ropts.ballot = b
        ropts.shadow = sh

      #to be changed
      i = 0
      for j in judges
        ballot = ballots[i]
        jc = ballot.judges.length
        sc = ballot.shadows.length
        continue if jc + sc >= panelSize
        if jc < ballotPerMatch && jc < maxJudges
          addJudge j, ballot
        else if sc < maxShadows
          addJudge j, ballot, true
        else
          @freeJudges.push j
        i = 0 if ++i >= noBallots

      for j in shadowJudges
        ballot = ballots[i]
        jc = ballot.judges.length
        sc = ballot.shadows.length
        if jc + sc < panelSize && sc < maxShadows
          addJudge j, ballot, true
        else
          @freeJudges.push j
        i = 0 if ++i >= noBallots

    assignRooms: ->
      ballots = _.filter @ballots, (o) -> !o.locked
      rooms = []
      for ballot in ballots
        if ballot.room?
          rooms.push ballot.room
      rooms = rooms.concat @freeRooms
      n = rooms.length
      id = @id
      for ballot, i in ballots
        break if i >= n
        room = rooms[i]
        room.rounds[id].ballot = ballot
        ballot.room = room
      rooms.splice 0, ballots.length
      @freeRooms = rooms

    shuffleRooms: ->
      id = @id
      lockedBallots = _.filter @ballots, (o) -> o.locked
      ballots = _.shuffle _.filter @ballots, (o) -> !o.locked
      rooms = _.map ballots, (o) -> o.room
      for ballot,i in ballots
        room = rooms[i]
        room.rounds[id].ballot = ballot
        ballot.room = room
        @ballots[i] = ballot
      n = ballots.length
      for ballot, i in lockedBallots
        @ballots[i + n] = ballot

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      model.teams = Util.packCycles @teams, @tournament.teams
      model.judges = Util.packCycles @judges, @tournament.judges
      model.freeJudges = Util.packCycles @freeJudges, @tournament.judges
      model.rooms = Util.packCycles @rooms, @tournament.rooms
      model.freeRooms = Util.packCycles @freeRooms, @tournament.rooms
      model.rankFrom = {all:@rankFrom.all}
      for r in @tournament.rounds
        v = @rankFrom[r.id]
        if v?
          model.rankFrom[id] = v
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
