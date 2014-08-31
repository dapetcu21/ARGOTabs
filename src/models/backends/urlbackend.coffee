define ['../backend_import', '../source'], (Backend, Source) ->
  class URLSource extends Source
    load: (fn, fnErr = ->) ->
      xhr = $.ajax
        url: @url(),
        dataType: 'text',

      xhr.done (data) ->
        fn(data)

      xhr.fail fnErr

    save: -> return
    canSave: -> false

  class URLBackend extends Backend
    schemas: -> ['http', 'https', 'file']

    load: (url) -> new URLSource(@, url)
    fetch: (fn) -> return


