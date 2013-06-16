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
        fn()
        return

    toFile: ->
      model = {}
      for key, value of this
        model[key] = value
      privates = ['backend']
      for key in privates
        model[key] = undefined

      JSON.stringify model

    save: (fn, force = false) ->
      @backend.save @toFile(), fn, force

