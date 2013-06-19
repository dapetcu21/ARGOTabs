define ['util', 'club', 'team', 'judge', 'room'], (Util, Club, Team, Judge, Room) ->
  class Tournament
    constructor: (@backend) ->
      @clubs = []

    load: (fn) ->
      @backend.load (loadedString) =>
        try model = JSON.parse(loadedString) catch
        model ?= {}
        @clubs = []
        @teams = []
        @judges = []
        @rooms = []

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

        for club in @clubs
          club.unpackCycles()
        for team in @teams
          team.unpackCycles()
        for judge in @judges
          judge.unpackCycles()
        for room in @rooms
          room.unpackCycles()

        @lastData = @toFile()
        fn()
        return

    toJSON: ->
      Util.copyObject this, ['backend', 'lastData']

    toFile: ->
      JSON.stringify this

    save: (fn, force = false) ->
      @saveData @toFile(), fn, force

    saveIfRequired: (fn, force = false) ->
      data = @toFile()
      return false if @lastData == data
      @saveData data, fn, force
      return true
    
    saveData: (data, fn, force = false) ->
      @backend.save data, =>
        @lastData = data
        fn()
      , force

