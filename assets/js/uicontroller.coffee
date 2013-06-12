define ['jquery', 'jquery.bootstrap', 'opencontroller'], ($, bs, OpenController) ->
  class UIController
    constructor: ->
      $(document).ready =>
        @open()

    open: ->
      new OpenController(this)

    getTournament: -> @tournament
    setTournament: (@tournament) ->

