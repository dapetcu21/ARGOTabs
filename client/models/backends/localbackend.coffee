define ['../backend_import', '../source'], (Backend, Source) ->
  class LocalSource extends Source
    constructor: () ->
      super
      @loadDate = new Date()
      @date = this.modifiedDate()
      @fName = @fileName()

    exists: ->
      localStorage.hasOwnProperty(@fName + '.atab')

    modifiedDate: ->
      date = localStorage.getItem(@fName + '.mdate')
      if date? then new Date(parseInt(date.match(/\d+/)[0])) else @loadDate

    load: (fn, fnErr = ->) ->
      try
        obj = localStorage.getItem(@fName + ".atab")
        obj ?= ""
        @loadDate = new Date()
        fn(obj)
      catch err
        fnErr err
      return

    save: (obj, fn, force=false) ->
      if not force and @modifiedDate().getTime() > @loadDate.getTime()
        e = new Error("This tournament was modified by an external program since we opened it. Make sure it's not open in another ARGO Tabs window")
        e.canForce = "Save anyway"
        throw e
      @loadDate = new Date()
      
      localStorage.setItem(@fName + '.atab', obj)
      localStorage.setItem(@fName + '.mdate', @loadDate.getTime())

      fn()
      return

    delete: ->
      localStorage.removeItem(@fName + '.atab')
      localStorage.removeItem(@fName + '.mdate')

    canRename: (newName) ->
      !localStorage.hasOwnProperty(newName + '.atab')

    rename: (newName) ->
      @load (obj) =>
        @delete()
        @_url = @backend.urlFromFileName(newName)
        @fName = newName
        @save obj, (->), true

  class LocalBackend extends Backend
    icon: -> '<i class="fa fa-fw fa-file"></i>'
    schemas: -> ['local']
    list: (fn) ->
      result = []
      for i in [0...localStorage.length]
        v = localStorage.key(i).match(/^(.*)\.atab$/)
        if (v and v[1])
          fn @load @urlFromFileName v[1]
      return
    load: (url) ->
      new LocalSource(@, url)

    urlFromFileName: (fname) ->
      return 'local://localhost/' + encodeURIComponent(fname + '.atab')

