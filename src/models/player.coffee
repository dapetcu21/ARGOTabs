define ['core/util', './uuid'], (Util, UUID) ->
  class Player
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= 'Unnamed'
      @id ?= UUID 'player_'

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
        replyBallots: 0
        scoreHighLow: 0
        breakdown: []

      for roundId in rounds
        roundId = roundId.id if typeof roundId == 'object'
        o.breakdown.push(null)

        round = @tournament.roundWithId roundId
        continue if not @team?
        ballot = @team.rounds[roundId].ballot
        continue if not ballot or not ballot.locked or not ballot.roles?
        if @team == ballot.teams[0]
          side = 0
        else if @team == ballot.teams[1]
          side = 1
        else continue

        didReply = ballot.roles[side][3] == this
        didSpeech = false
        for i in [0...3]
          if ballot.roles[side][i] == this
            didSpeech = true
            break

        roundScore = 0
        roundScoreCount = 0

        if ballot.presence[side]
          if ballot.presence[1-side] and ballot.teams[1-side]
            if didSpeech
              o.roundsPlayed++
              for speaker in [0...3]
                continue if ballot.roles[side][speaker] != this
                for vote in ballot.votes
                  score = vote.scores[side][speaker]
                  roundScore += score * vote.ballots
                  roundScoreCount += vote.ballots
                  o.rawScore += score * vote.ballots
                  o.scoreCount += vote.ballots
                  if score < o.minScore
                    o.minScore = score
                  if score > o.maxScore
                    o.maxScore = score
            if didReply
              o.roundsReplyed++
              for vote in ballot.votes
                score = vote.scores[side][3]
                o.rawReply += score * vote.ballots
                o.replyCount += vote.ballots
          else
            if didSpeech
              o.byes += round.ballotsPerMatchSolved()
              o.roundsPlayed++
            if didReply
              o.replyByes += round.ballotsPerMatchSolved()
              o.roundsReplyed++

        if roundScoreCount
          o.breakdown[o.breakdown.length - 1] = (roundScore / roundScoreCount)

      allScores = o.scoreCount + o.byes
      o.replyBallots = o.replyCount + o.replyByes
      o.score = if o.scoreCount then o.rawScore / o.scoreCount else if o.byes then -1 else 0
      o.reply = if o.replyCount then o.rawReply / o.replyCount else if o.replyByes then -1 else 0
      o.scoreHighLow = 0

      if allScores > 2
        o.highLowScoreCount = allScores - 2
        if o.scoreCount
          o.rawHighLow = o.rawScore + o.score * o.byes - o.minScore - o.maxScore
          o.scoreHighLow = o.rawHighLow / o.highLowScoreCount
        else
          o.rawHighLow = -1
          o.scoreHighLow = -1
      else
        o.highLowScoreCount = 0
        o.rawHighLow = 0
        o.scoreHighLow = 0
      return o
