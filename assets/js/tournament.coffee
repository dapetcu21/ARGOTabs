define ->
  class Tournament
    constructor: (@backend) ->

    load: (fn) ->
      @backend.load (loadedString) =>
        try model = JSON.parse(loadedString) catch
        model ?= {}
        @name = model.name
        @name ?= "No namer"
        fn()
        return

    toFile: ->
      model =
        name: @name
      JSON.stringify model

    save: (fn, force = false) ->
      @backend.save @toFile(), fn, force

