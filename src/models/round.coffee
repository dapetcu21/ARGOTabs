define ['core/util', './ballot', './judge', './sorter', './judgerules', './team', './uuid'], (Util, Ballot, Judge, Sorter, JudgeRules, Team, UUID) ->
 class Round
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @id ?= UUID 'round_'
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
      @judgeMainPriority ?= null
      @judgeMainOrder ?= null
      @judgeShadowPriority ?= null
      @judgeShadowOrder ?= null
      @judgeShadowReport ?= null
      @caMode ?= true
      @showConflicts ?= true
      @showShadowConflicts ?= true
      @showRanks ?= true
      @printCAMode ?= false
      @pairRankSorter = Sorter.teamRankSorter @pairRankSorter
      @judgeRules = new JudgeRules @tournament, @judgeRules
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
    maxShadowJudgesSolved: -> if @maxShadowJudges? then @maxShadowJudges else @tournament.maxShadowJudges
    maxPanelSizeSolved: -> if @maxPanelSize? then @maxPanelSize else @tournament.maxPanelSize
    pairRankSorterSolved: -> if @inheritPairRank then @tournament.pairRankSorter else @pairRankSorter
    allowShadowsSolved: -> if @allowShadows? then @allowShadows else @tournament.allowShadows
    judgeMainPrioritySolved: -> if @judgeMainPriority? then @judgeMainPriority else @tournament.judgeMainPriority
    judgeMainOrderSolved: -> if @judgeMainOrder? then @judgeMainOrder else @tournament.judgeMainOrder
    judgeShadowPrioritySolved: -> if @judgeShadowPriority? then @judgeShadowPriority else @tournament.judgeShadowPriority
    judgeShadowOrderSolved: -> if @judgeShadowOrder? then @judgeShadowOrder else @tournament.judgeShadowOrder
    judgeShadowReportSolved: -> if @judgeShadowReport? then @judgeShadowReport else @tournament.judgeShadowReport

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

    previousRound: ->
      if @rankFrom.all
        r = null
        for round in @tournament.rounds
          break if round == this
          if round.paired
            r = round
        return r
      else
        for round in @tournament.rounds by -1
          if round.paired and @rankFrom[round.id]
            return round

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

    sortBallots: ->
      @ballots.sort (a,b) -> a.skillIndex - b.skillIndex

    censor: ->
      @judgeRules = JudgeRules.mainRules @tournament
      @caMode = false
      _.each @ballots, (ballot) ->
        delete ballot.skillIndex = 0
      @ballots.sort (a, b) ->
        return -1 if not b.room?
        return  1 if not a.room?
        Util.naturalSort a.room.name, b.room.name

    pairingTeams: ->
      id = @id
      _.filter @teams, (o) -> o.rounds[id].participates

    pairTeams: (a, b, skillIndex = 0) ->
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
      @ballots.push ballot
      if a
        a.rounds[@id].ballot = ballot
        a.stats.paired = true
      if b
        b.rounds[@id].ballot = ballot
        b.stats.paired = true
      return ballot

    pair: (opts) ->
      teams = @pairingTeams()
      prevRounds = @previousRounds()
      @sortByRank teams, prevRounds
      id = @id

      flip = !opts.manualSides || opts.algorithm != 1
      balance = opts.balanceSides
      balance ?= true

      pairTeams = (a, b, skillIndex = 0) =>
        swp = false
        if flip and a? and b?
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
              swp = true
          else
            if sa == 1 or sb == 0
              swp = true
        if swp
          @pairTeams b, a, skillIndex
        else
          @pairTeams a, b, skillIndex

      #pick bye team
      bye = null
      if teams.length & 1 and opts.algorithm != 1
        if not opts.algorithm and (opts.randomBye or not prevRounds.length)
          bye = teams.splice(Math.floor(Math.random() * teams.length), 1)[0]
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
            return if u == t
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
            if cmp == 1
              aux = min
              min = score
              score = aux
              r = u
            return zero
          return r

      # To prevent edge case when no restrictions are applicable
      restrictions.conditions.push () -> 1

      if opts.hardSides
        restrictions.conditions.push (a, b) ->
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

      if opts.noClubMatches and (opts.algorithm == 0 or opts.algorithm == 2)
        restrictions.conditions.push (a, b) ->
          if a.club? and b.club? and a.club == b.club then 1 else 0

      skillIndex = 0
      n = teams.length
      switch opts.algorithm
        when 1 #manual
          for o in opts.manualPairing
            pairTeams o.prop, o.opp
        when 0,2 #random, high-high
          for t, i in teams
            continue if t.stats.paired
            m = restrictions.match t, (test) ->
              for j in [i+1...n]
                if test teams[j]
                  return
            pairTeams t, m, skillIndex++
        when 3 #high-low
          brackets = {}
          vb = []
          for t, i in teams
            t.stats.rank = i
            nbal = t.stats.wins
            bracket = brackets[nbal]
            if not bracket?
              bracket = brackets[nbal] =
                teams: []
                ballots: nbal
              vb.push bracket
            bracket.teams.push t

          #calculate opposition ranks
          if opts.evenBrackets == 1
            for t in teams
              avgc = 0
              t.stats.oppRank = 0
              for rnd in prevRounds
                bal = t.rounds[rnd.id].ballot
                if bal?
                  ta = bal.teams[0]
                  tb = bal.teams[1]
                  if ta == t and tb? and tb.stats? and tb.stats.rank?
                    avgc++
                    t.stats.oppRank += tb.stats.rank
                  else if tb == t and ta? and ta.stats? and ta.stats.rank?
                    avgc++
                    t.stats.oppRank += ta.stats.rank
              if avgc
                t.stats.oppRank /= avgc
              else
                t.stats.oppRank = Number.MAX_VALUE

          switch opts.evenBrackets
            when 0 #pull down
              pull = (bracket, count, avoidedSide) ->
                bracket.teams.sort (a, b) ->
                  b.stats.rank - a.stats.rank
                bracket.teams = _.filter bracket.teams, (a) ->
                  if count > 0 and (not avoidedSide? or avoidedSide == a.stats.side)
                    count--
                    nextBracket.teams.push a
                    return false
                  return true
            when 1 #pull up
              pull = (bracket, count, avoidedSide) ->
                cni = i + 1
                _nextBracket = vb[cni]
                while count and cni < vbn
                  nbv = _nextBracket.teams
                  nbv.sort (a, b) ->
                    b.stats.oppRank - a.stats.oppRank
                  _nextBracket.teams = nbv = _.filter nbv, (a) ->
                    if count > 0 and (not avoidedSide? or avoidedSide != a.stats.side)
                      count--
                      bracket.teams.push a
                      return false
                    return true
                  _nextBracket = vb[++cni]

          vb.sort (a, b) ->
            b.ballots - a.ballots

          vbn = vb.length
          for bracket, i in vb
            bo = bp = bu = 0
            bn = bracket.teams.length
            continue if not bn
            for t in bracket.teams
              switch t.stats.side
                when 0
                  bp++
                when 1
                  bo++
                when undefined
                  bu++

            nextBracket = vb[i + 1]
            if nextBracket?
              if opts.hardSides
                if bo > bp + bu
                  pull bracket, bo - bp - bu, 1
                else if bp > bo + bu
                  pull bracket, bp - bo - bu, 0
                else if bn & 1
                  pull bracket, 1
              else if bn & 1
                pull bracket, 1

              j = i + 1
              while nextBracket? and nextBracket.length == 0
                nextBracket = vb[++j]

              if nextBracket?
                bn = bracket.teams.length
                nbv = nextBracket.teams
                if bn < opts.matchesPerBracket * 2
                  bracket.teams.forEach (o) ->
                    nbv.push o
                  bracket.teams.length = 0

            bracket.teams.sort (a, b) ->
              a.stats.rank - b.stats.rank

            for t in bracket.teams
              continue if t.stats.paired
              m = restrictions.match t, (test) ->
                for tt in bracket.teams by -1
                  if test tt
                    return
              pairTeams t, m, skillIndex++

      if bye?
        pairTeams bye, null, skillIndex
      @paired = true

      @assignRooms()
      if opts.shuffleRooms and opts.algorithm
        @shuffleRooms()

      @assignJudges()

    assignJudges: ->
      id = @id
      ballots = _.sortBy (_.shuffle (_.filter @ballots, ((o)-> !o.locked && o.teams[0] && o.teams[1]) ) ), (o) -> o.skillIndex

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
      freeJ = @freeJudges = []

      participationScores = {}
      _.each judges, (judge) ->
        sum = 0
        _.each @rounds, (round) ->
          ropts = judge.rounds[round.id]
          if ropts && ropts.participates && ropts.ballot && ropts.ballot.locked
            sum += ropts.shadow ? 1 : 2
        participationScores[judge.id] = sum

      judges.sort (a,b) ->
        cmp = a.rank - b.rank
        if cmp != 0
          return cmp
        psa = participationScores[a.id]
        psb = participationScores[b.id]
        return psa - psb

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

      compat = (judge, ballot) ->
        0

      rules = @judgeRules
      mainRules = @tournament.judgeRules

      assign = (judges, order, priority, shadow, judgeCount) ->
        for b in ballots
          b.maxJudgeCount = judgeCount b
          b.judgeCount = 0
        saturated = 0
        left = n = judges.length
        while left and saturated != noBallots
          saturated = 0
          for b in ballots by (if order then -1 else 1)
            if b.maxJudgeCount <= b.judgeCount
              saturated++
            else
              b.judgeCount++
              left--
            break if not left

        filled = 1
        while filled
          filled = 0
          for b in ballots by (if priority then -1 else 1)
            continue if b.judgeCount <= 0
            judge = null
            min = Number.MAX_VALUE
            for j in judges
              if not j.rounds[id].ballot?
                score = rules.compatibilityFactor j, b, mainRules
                if score < min
                  min = score
                  judge = j
                  if not score
                    break
            addJudge judge, b, shadow
            b.judgeCount--
            filled++


      mainsPerMatch = ballotPerMatch
      if panelSize < mainsPerMatch
        mainsPerMatch = panelSize
      if maxJudges < mainsPerMatch
        mainsPerMatch = maxJudges
      assign judges, @judgeMainOrderSolved(), @judgeMainPrioritySolved(), false, -> mainsPerMatch

      judges.forEach (o) ->
        if not o.rounds[id].ballot?
          freeJ.push o

      report = @judgeShadowReportSolved()
      assign (if report then freeJ.concat shadowJudges else shadowJudges), @judgeShadowOrderSolved(), @judgeShadowPrioritySolved(), true, (ballot) ->
        ps = panelSize - ballot.judges.length
        if maxShadows < ps
          maxShadows
        else
          ps

      if report
        freeJ.length = 0
        judges.forEach (o) ->
          if not o.rounds[id].ballot?
            freeJ.push o
          
      shadowJudges.forEach (o) ->
        if not o.rounds[id].ballot?
          freeJ.push o

      for b in ballots
        delete b.maxJudgeCount
        delete b.judgeCount

    assignRooms: ->
      ballots = _.filter @ballots, (o) -> !o.locked
      rooms = []
      for ballot in ballots
        if ballot.room?
          rooms.push ballot.room
      for room in @freeRooms
        rooms.push room
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
      ballots = _.filter @ballots, (o) -> !o.locked
      rooms = _.map ballots, (o) -> o.room
      ballots = _.shuffle ballots
      i = 0
      for bal,j in @ballots
        continue if bal.locked
        ballot = ballots[i]
        room = rooms[i]
        if room?
          room.rounds[id].ballot = ballot
        ballot.room = room
        @ballots[j] = ballot
        i++

    shuffle: ->
      locked = []
      unlocked = []
      for b in @ballots
        if b.teams[0]? and b.teams[1]?
          unlocked.push b
        else
          locked.push b
      unlocked = _.shuffle unlocked
      for b, i in unlocked
        @ballots[i] = b
      n = unlocked.length
      for b, i in locked
        @ballots[i+n] = b

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
