define ->
  class Club
    constructor: (@tournament, other) ->
      if other
        for key, value in other
          this[key] = value
      @name ?= ""
      #TODO: fromJSON here if it's the case

    toJSON: ->
        model = {}
        for key, value of this
          model[key] = value
        privates = ['tournament']
        for key in privates
          model[key] = undefined
        return model

