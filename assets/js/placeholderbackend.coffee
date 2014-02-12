define ['backend'], (Backend) ->
  class PlaceholderBackend extends Backend
    constructor: () ->

    @icon = '<i class="fa fa-fw fa-file"></i>'

    modifiedDate: ->
      date = localStorage.getItem(@fName + '.mdate')
      if date? then new Date(parseInt(date.match(/\d+/)[0])) else @loadDate

    load: (fn) ->
      fn "{\"name\":\"Placeholder tournament\"}"
      return

    save: (obj, fn, force=false) ->
      return

    delete: ->
      return

    rename: (newName) ->
      return

    @listFiles: (fn)->
      fn []
      return

    fileName: ->
      "Placeholder tournament"
