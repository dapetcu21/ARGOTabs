define ['jquery'], ($) ->
  class Tournament
    constructor: (@backend) ->
    load: (fn) ->
      @backend.load (loadedString) ->
        model = try $.parseJSON(loadedString) catch
        model ?= {}
        @name = model.name
        @name = "No namer" if @name == "undefined"
        fn()
        return

    save: (fn) ->
      model =
        name: @name
      @backend.save model.toJSON(), fn

