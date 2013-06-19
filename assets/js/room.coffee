define ['util'], (Util)->
  class Room
    constructor: (@tournament, other) ->
      if other
        for key, value of other
          this[key] = value
      @name ?= ""
      @floor ?= ""

    unpackCycles: ->

    toJSON: ->
      model = Util.copyObject this, ['tournament']
      return model

    destroy: ->
