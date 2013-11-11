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

    getName: ->
      idx = @tournament.rounds.indexOf this
      if idx != -1
        return "Round " + (idx + 1)
      return "<undefined>"

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
    
    sortByRank: (array, prev = @previousRounds()) ->
      Team.calculateStats array, prev
      sorter = @pairRankSorterSolved().boundComparator()
      array.sort (a,b) -> sorter a.stats, b.stats

    pairingTeams: ->
      id = @id
      teams = _.filter @teams, (o) -> o.rounds[id].participates

    pair: (opts) ->
      teams = @pairingTeams()
      prevRounds = @previousRounds()
      @sortByRank teams, prevRounds
      id = @id

      flip = !opts.manualSides || opts.algorithm != 1
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
            sa = a.stats.side
            sb = b.stats.side
            if sa == sb and opts.sides == 1
              da = Math.abs(a.stats.prop - a.stats.opp)
              db = Math.abs(b.stats.prop - b.stats.opp)
              if da > db
                sb = 1 - sb
              else if db > da
                sa = 1 - sa
            if sa == sb
              if Math.random() > 0.5
                ballot.teams[0] = b
                ballot.teams[1] = a
            else
              if sa == 1 or sb == 0
                ballot.teams[0] = b
                ballot.teams[1] = a
        @ballots.push ballot
        if a
          a.rounds[id].ballot = ballot
          a.stats.paired = true
        if b
          b.rounds[id].ballot = ballot
          b.stats.paired = true

      #pick bye team
      bye = null
      if teams.length & 1 and opts.algorithm != 1
        if not opts.algorithm and (opts.randomBye or not prevRounds.length)
          bye = teams.splice Math.floor(Math.random() * teams.length), 1
        else
          minByes = Number.MAX_VALUE
          index = -1
          for i in [teams.length-1..0]
            t = teams[i]
            nB = 0
            for round in prevRounds
              try
                nB++ if not t.rounds[round.id].ballot.teams[1]
              catch
            if nB < minByes
              bye = t
              index = i
              minByes = nB

          teams.splice index, 1

      #mark side constraints
      if opts.sides == 1
        for team in teams
          prop = team.stats.prop
          opp = team.stats.opp
          if opp > prop
            team.stats.side = 0
          else if prop > opp
            team.stats.side = 1
      else if typeof opts.sides == 'object'
        rid = opts.sides.roundId
        fl = opts.sides.flip
        for team in teams
          ballot = team.rounds[rid].ballot
          if ballot? and ballot.teams[1]?
            team.stats.side = (ballot.teams[1] == team) ^ fl

      #the actual pairing
      if opts.algorithm == 0
        teams = _.shuffle teams

      restrictions =
        conditions: []
        match: (t, looper) ->
          v = @conditions
          nv = v.length
          min = new Array nv
          score = new Array nv
          for e, ii in v
            min[ii] = Number.MAX_VALUE
          r = null
          looper (u) ->
            return if u.stats.paired
            cmp = 0
            zero = true
            for cond, k in v
              score[k] = cond t, u
              if score[k]
                zero = false
              if cmp == 0
                if score[k] < min[k]
                  cmp = 1
                else if score[k] > min[k]
                  cmp = 2
            console.log min, score, cmp, zero
            if cmp == 1
              aux = min
              min = score
              score = aux
              r = u
            return zero
          return r

      if opts.hardSides
        restrictions.conditions.push (a, b) ->
          console.log a.name, a.stats.side, b.name, b.stats.side
          if a.stats.side? and b.stats.side? and a.stats.side == b.stats.side then 1 else 0

      if opts.minimizeReMeet
        restrictions.conditions.push (a, b) ->
          count = 0
          for round in prevRounds
            ballot = a.rounds[round.id].ballot
            if ballot? and (
              (ballot.teams[0] == a and ballot.teams[1] == b) or
              (ballot.teams[1] == a and ballot.teams[0] == b))
              count++
          return count

      skillIndex = 0
      n = teams.length
      switch opts.algorithm
        when 1 #manual
          for o in opts.manualPairing
            pairTeams o.prop, o.opp
        when 0,3 #random, high-high
          for t, i in teams
            continue if t.stats.paired
            console.log t.name, "t"
            m = restrictions.match t, (test) ->
              for j in [i+1...n]
                if test teams[j]
                  return
            pairTeams t, m, if opts.algorithm then skillIndex++ else 0
        when 4 #high-low
          throw new Error("High-Low unimplemented")
      if bye?
        pairTeams bye, null
      @paired = true


      @assignRooms()
      if opts.shuffleRooms and opts.algorithm
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
      rooms = _.filter (_.map ballots, (o) -> o.room), (o) -> o
      rn = rooms.length
      for ballot,i in ballots
        if i < rn
          room = rooms[i]
          room.rounds[id].ballot = ballot
          ballot.room = room
        else
          ballot.room = null
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
    @algoName = ['Random', 'Manual', 'High-High Power Pairing', 'High-Low Power Pairing']
