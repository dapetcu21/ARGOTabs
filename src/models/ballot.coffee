define ['core/util', 'underscore', './uuid'], (Util, _, UUID) ->
  class Ballot
    constructor: (@round, other) ->
      if other
        for key, value of other
          this[key] = value
      @teams ?= [null, null]
      @presence ?= [true, true]
      @room ?= null
      @locked ?= false
      @id ?= UUID 'ballot_'
      @votes ?= []
      @judges ?= []
      @shadows ?= []
      @roles ?= null

    getSpeakerRoles: ->
      roles = [{roles:[]},{roles:[]}]
      if @roles
        for i in [0..1]
          for j in [0..3]
            roles[i].roles.push @roles[i][j]
        return roles
      pushRoles = (team, r) =>
        v = @round.previousRounds()
        for pr in v by -1
          bal = team.rounds[pr.id]
          if bal?
            bal = bal.ballot
            if bal?
              side = 0
              if bal.teams[1] == team
                side = 1
              continue if not bal.roles?
              v = bal.roles[side]
              continue if not v?
              for i in v
                r.push i
              return
        n = team.players.length
        if n
          for l in [0..2]
            r.push team.players[l%n]
          r.push team.players[0]
        else
          for l in [0..3]
            r.push null
        return
      pushRoles @teams[0], roles[0].roles
      pushRoles @teams[1], roles[1].roles
      return roles

    isCompatible: (judge) ->
      return false
      return @round.judgeRules.isCompatible(this, judge)

    getVotesForBallots: (b) ->
      if @votes and @votes.length
        votes = []
        for v in @votes
          votes.push Util.deepCopy v, ['judge']
        return votes
      judges = @judges
      n = judges.length
      votes = []
      tournament = @round.tournament
      avgCons = (tournament.minConstructiveScore + tournament.maxConstructiveScore) / 2
      avgReply = (tournament.minReplyScore + tournament.maxReplyScore) / 2
      newVote = (judge, bal = 1) ->
        v = {}
        v.judge = judge
        v.ballots = bal
        v.prop = bal
        v.opp = 0
        v.scores = [[avgCons, avgCons, avgCons, avgReply], [avgCons, avgCons, avgCons, avgReply]]
        return v
      if n
        if n >= b
          for i in [0...b]
            votes.push newVote judges[i]
        else
          dv = (b/n) | 0
          md = b%n
          for i in [0...n]
            votes.push newVote judges[i], dv + if i<md then 1 else 0
      else
        #votes.push newVote null, b
        for i in [0...b]
          votes.push newVote null
      return votes

    unpackCycles: ->
      @teams[0] = Util.unpackCycle @teams[0], @round.tournament.teams
      @teams[1] = Util.unpackCycle @teams[1], @round.tournament.teams
      @room = Util.unpackCycle @room, @round.tournament.rooms
      Util.unpackCycles @judges, @round.tournament.judges
      Util.unpackCycles @shadows, @round.tournament.judges
      if @roles?
        for i in [0..1]
          continue if not @teams[i]?
          v = @roles[i]
          for j in [0...v.length]
            v[j] = Util.unpackCycle v[j], @teams[i].players
      for vote in @votes
        vote.judge = Util.unpackCycle vote.judge, @round.tournament.judges
    
    toJSON: ->
      model = Util.copyObject this, ['round', 'stats']
      model.teams = [
        Util.packCycle(@teams[0], @round.tournament.teams),
        Util.packCycle(@teams[1], @round.tournament.teams) ]
      if @roles?
        model.roles = [[],[]]
        for i in [0..1]
          continue if not @teams[i]?
          v = model.roles[i]
          vv = @roles[i]
          for o in vv
            v.push Util.packCycle o, @teams[i].players
      model.votes = []
      for v in @votes
        vote = Util.copyObject v
        vote.judge = Util.packCycle vote.judge, @round.tournament.judges
        model.votes.push vote
      model.room = Util.packCycle @room, @round.tournament.rooms
      model.judges = Util.packCycles @judges, @round.tournament.judges
      model.shadows = Util.packCycles @shadows, @round.tournament.judges
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
