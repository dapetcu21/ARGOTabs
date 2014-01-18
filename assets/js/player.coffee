define ['util'], (Util) ->
  class Player
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= "Unnamed"

    unpackCycles: ->
      @team = Util.unpackCycle @team, @tournament.teams
    
    toJSON: ->
      model = Util.copyObject this, ['tournament', 'stats']
      model.team = Util.packCycle @team, @tournament.teams
      return model

    destroy: ->
      if @team
        @team.removePlayer(this)

    @calculateStats: (players, rounds) ->
      for p in players
        p.stats = p.getStats rounds

    getStats: (rounds) ->
      o =
        rawScore: 0
        rawReply: 0
        rawHighLow: 0
        roundsPlayed: 0
        roundsReplyed: 0
        scoreCount: 0
        replyCount: 0
        byes: 0
        replyByes: 0
        minScore: 80
        maxScore: 0
        score: 0
        reply: 0 #average
        ballots: 0
        replyBallots: 0
        scoreHighLow: 0
      for roundId in rounds
        roundId = roundId.id if typeof roundId == 'object'
        round = @tournament.roundWithId roundId
        continue if not @team?
        ballot = @team.rounds[roundId].ballot
        continue if not ballot or not ballot.locked or not ballot.roles?
        if @team == ballot.teams[0]
          side = 0
        else if @team == ballot.teams[1]
          side = 1
        else continue
        speaker = -1
        for i in [0...4]
          if ballot.roles[side][i] == this
            speaker = i
            break
        continue if speaker == -1

        if ballot.presence[side]
          if ballot.presence[1-side] and ballot.teams[1-side]
            if speaker != 3
              o.roundsPlayed++
              for vote in ballot.votes
                score = vote.scores[side][speaker]
                o.rawScore += score * vote.ballots
                o.scoreCount += vote.ballots
                if score < o.minScore
                  o.minScore = score
                if score > o.maxScore
                  o.maxScore = score
            else
              o.roundsReplyed++
              for vote in ballot.votes
                score = vote.scores[side][3]
                o.rawReply += score * vote.ballots
                o.replyCount += vote.ballots
          else
            if speaker != 3
              o.byes += round.ballotsPerMatchSolved()
              o.roundsPlayed++
            else
              o.replyByes += round.ballotsPerMatchSolved()
              o.roundsReplyed++
      o.ballots = o.scoreCount + o.byes
      o.replyBallots = o.replyCount + o.replyByes
      o.score = if o.scoreCount then o.rawScore / o.scoreCount else if o.byes then -1 else 0
      o.reply = if o.replyCount then o.rawReply / o.replyCount else if o.replyByes then -1 else 0
      if o.ballots > 2
        if o.scoreCount
          o.scoreHighLow = (o.rawScore + o.score * o.byes - o.minScore - o.maxScore) / (o.ballots - 2)
        else
          o.scoreHighLow = -1
      else
        o.scoreHighLow = 0
      o.wins = o.rawWins + o.byeWins
      o.ballots = o.rawBallots + o.byeBallots
      return o
