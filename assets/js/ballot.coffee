define ['util', 'underscore'], (Util) ->
  class Ballot
    constructor: (@round, other) ->
      if other
        for key, value of other
          this[key] = value
      @teams ?= [null, null]
      @presence ?= [true, true]
      @room ?= null
      @locked ?= false
      @votes ?= []
      @judges ?= []
      @roles ?= null

    getSpeakerRoles: ->
      roles = [{roles:[]},{roles:[]}]
      if @roles
        for i in [0..1]
          for j in [0..3]
            roles[i].roles.push @roles[i][j]
        return roles
      pushRoles = (team, r) ->
        n = team.players.length
        if n
          for l in [0..2]
            r.push team.players[l%n]
          r.push team.players[0]
        else
          for l in [0..3]
            r.push null
      pushRoles @teams[0], roles[0].roles
      pushRoles @teams[1], roles[1].roles
      return roles

    getVotesForBallots: (b) ->
      deepCopy = (v) -> JSON.parse JSON.stringify v
      if @votes and @votes.length
        votes = []
        for v in @votes
          votes.push Util.deepCopy v, ['judge']
        return votes
      judges = _.filter @judges, (x) -> x.rank != Judge.shadowRank
      n = judges.length
      votes = []
      newVote = (judge, bal = 1) ->
        v = {}
        v.judge = judge
        v.ballots = bal
        v.prop = bal
        v.opp = 0
        v.scores = [[70, 70, 70, 35], [70, 70, 70, 35]]
        return v
      if n
        if n >= b
          for i in [0...b]
            votes.push newVote judges[i]
        else
          dv = b/n
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
      if @roles?
        for i in [0..1]
          continue if not @teams[i]?
          v = @roles[i]
          for j in [0...v.length]
            v[j] = Util.unpackCycle v[j], @teams[i].players
    
    toJSON: ->
      model = Util.copyObject this, ['round']
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
      model.room = Util.packCycle @room, @round.tournament.rooms
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
