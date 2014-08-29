define ['../backend_import', '../source'], (Backend, Source) ->
  class PlaceholderSource extends Source
    load: (fn) ->
      fn
        name: 'Placeholder tournament'

    save: -> return
    url: -> 'placeholder://localhost/Placeholder tournament.atab'

  class PlaceholderBackend extends Backend
    schemas: -> ['placeholder']

    load: (url) -> new PlaceholderSource()
    fetch: (fn) -> return


