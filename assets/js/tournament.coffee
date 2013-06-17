define ['club'], (Club) ->
  class Tournament
    constructor: (@backend) ->
      @clubs = []

    load: (fn) ->
      @backend.load (loadedString) =>
        try model = JSON.parse(loadedString) catch
        model ?= {}
        @clubs = []
        for key, value of model
          this[key] = value
        for club in @clubs
          newClub = new Club(this, club)

        @lastData = @toFile()
        fn()
        return

    toFile: ->
      model = {}
      for key, value of this
        model[key] = value
      privates = ['backend', 'lastData']
      for key in privates
        model[key] = undefined

      JSON.stringify model

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

