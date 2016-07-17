define ['./backend', '../core/util', './club', './team', './judge', './room', './player', './round', './sorter', './judgerules', './uuid'], (Backend, Util, Club, Team, Judge, Room, Player, Round, Sorter, JudgeRules, UUID) ->
  class Tournament
    constructor: (@source) ->
      @id = UUID 'tournament_'
      @clubs = []
      @teams = []
      @judges = []
      @rooms = []
      @players = []
      @rounds =[]
      @tableOpts = {}
      @ballotsPerMatch = 1
      @evenBrackets = 0
      @matchesPerBracket = 1
      @maxMainJudges = 10000
      @maxShadowJudges = 10000
      @maxPanelSize = 10000
      @judgeMainPriority = 0
      @judgeMainOrder = 0
      @judgeShadowPriority = 0
      @judgeShadowOrder = 0
      @judgeShadowReport = false
      @minPlayed = 1
      @allowShadows ?= true
      @rankFromTeams ?= {all:true}
      @rankFromSpeakers ?= {all:true}
      @loaded = false
      @minConstructiveScore = 60
      @maxConstructiveScore = 80
      @minReplyScore = 30
      @maxReplyScore = 40

    load: (fn, fnErr = ->) ->
      @source.load ((model) =>
        try
          if typeof(model) == 'string'
            model = JSON.parse(model)
          @loadFromModel model
        catch err
          fnErr err
          return
        fn()
        return
      ), fnErr

    loadFromModel: (model) ->
      model ?= {}
      for key, value of model
        this[key] = value

      for club, i in @clubs
        @clubs[i] = new Club(this, club)
      for team, i in @teams
        @teams[i] = new Team(this, team)
      for judge, i in @judges
        @judges[i] = new Judge(this, judge)
      for room, i in @rooms
        @rooms[i] = new Room(this, room)
      for player, i in @players
        @players[i] = new Player(this, player)
      for round, i in @rounds
        @rounds[i] = new Round(this, round)

      for club in @clubs
        club.unpackCycles()
      for team in @teams
        team.unpackCycles()
      for judge in @judges
        judge.unpackCycles()
      for room in @rooms
        room.unpackCycles()
      for player in @players
        player.unpackCycles()
      for round in @rounds
        round.unpackCycles()

      @speakerRankSorter = Sorter.speakerRankSorter model.speakerRankSorter
      @teamRankSorter = Sorter.teamRankSorter model.teamRankSorter
      @pairRankSorter = Sorter.teamRankSorter model.pairRankSorter
      @judgeRules = JudgeRules.mainRules this, model.judgeRules

      @lastData = @toFile()
      @loaded = true

    roundWithId: (id) ->
      for round in @rounds
        if '' + round.id == '' + id
          return round
      null

    toJSON: ->
      model = Util.copyObject this, ['source', 'lastData', 'loaded']
      model.rankFromTeams = {all:@rankFromTeams.all}
      for r in @rounds
        v = @rankFromTeams[r.id]
        if v?
          model.rankFromTeams[r.id] = v
      return model

    toFile: (pretty = false) ->
      if pretty
        JSON.stringify this, null, 2
      else
        JSON.stringify this

    save: (fn, force = false) ->
      @saveData @toFile(), fn, force

    saveIfRequired: (fn, force = false) ->
      data = @toFile()
      return false if @lastData == data
      @saveData data, fn, force
      return true
    
    saveData: (data, fn, force = false) ->
      return if !@loaded
      @source.save data, =>
        @lastData = data
        fn()
      , force

    clubWithName: (s) ->
      for c in @clubs
        if c.name == s
          return c
      return null

    censor: (ext) ->
      ext.censor(@) if ext

      _.each @judges, (judge) ->
        judge.rank = Judge.censoredRank

      @judges = _.shuffle @judges

      @judgeRules = JudgeRules.mainRules @
      _.each @rounds, (round) -> round.censor()

    addClub: (s) ->
      club = new Club this
      @clubs.push club
      club.name = s
      return club

    addTeam: (name, clubName, members) ->
      club = @clubWithName clubName
      if not club?
        club = @addClub clubName

      team = new Team this
      team.name = name
      team.club = club
      club.addTeam team

      for m in members
        p = team.addPlayer()
        p.name = m
      @teams.push team
      return team

    addJudge: (name, clubName, rank = 0) ->
      club = @clubWithName clubName
      if not club?
        club = @addClub clubName

      if rank == -1
        rank = Judge.shadowRank

      judge = new Judge this
      judge.name = name
      judge.club = club
      judge.rank = rank
      club.addJudge judge
      @judges.push judge
      return judge

    destroyEntityInJudgeRules: (e) ->
      @judgeRules.entityDestroyed e
      for r in @rounds
        r.judgeRules.entityDestroyed e

    @placeholderTournament: new Tournament(Backend.load('placeholder://localhost/Placeholder Tournament.atab'))
    @placeholderTournament.load ->
