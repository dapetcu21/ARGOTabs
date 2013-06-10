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

    save: (fn) ->
      model =
        name: @name
      @backend.save JSON.stringify(model), fn

