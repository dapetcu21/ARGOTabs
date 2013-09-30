define ['util', 'underscore'], (Util) ->
  class Ballot
    constructor: (@round, other) ->
      if other
        for key, value of other
          this[key] = value
      @prop ?= null
      @opp ?= null
      @room ?= null
      @locked ?= false
      @votes ?= []
      @judges ?= []

    getVotesForBallots: (b) ->
      deepCopy = (v) -> JSON.parse JSON.stringify v
      if @votes and @votes.length
        votes = []
        for v in @votes
          aux = {}
          exceptions = ['judge']
          for exp in exceptions
            aux[exp] = eval 'v.' + exp
            eval 'v.' + exp + '=null'
          vv = JSON.parse JSON.stringify v
          for exp in exceptions
            caux = aux[exp]
            eval 'v.' + exp + '=caux'
            eval 'vv.' + exp + '=caux'
          votes.push vv
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
      @prop = Util.unpackCycle @prop, @round.tournament.teams
      @opp = Util.unpackCycle @opp, @round.tournament.teams
      @room = Util.unpackCycle @room, @round.tournament.rooms
    
    toJSON: ->
      model = Util.copyObject this, ['round']
      model.prop = Util.packCycle @prop, @round.tournament.teams
      model.opp = Util.packCycle @opp, @round.tournament.teams
      model.room = Util.packCycle @room, @round.tournament.rooms
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)
