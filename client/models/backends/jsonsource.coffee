define ['../backend_import', '../source'], (Backend, Source) ->
  class JSONSource extends Source
    constructor: (@data) ->
      super({}, 'data:nourl')
    load: (fn, fnErr = ->) ->
      fn(@data)

    save: -> return
    canSave: -> false
