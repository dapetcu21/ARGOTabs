define ['../backend'], (Backend) ->
  class PlaceholderBackend extends Backend
    constructor: () ->
    load: (fn) -> fn "{\"name\":\"Placeholder tournament\"}"
    save: -> return
    delete: -> return
    rename: -> return
    @listFiles: (fn)-> fn []
    fileName: -> "Placeholder tournament"
