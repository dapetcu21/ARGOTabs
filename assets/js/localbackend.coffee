define ['backend'], (Backend) ->
  class LocalBackend extends Backend
    constructor: (@fName) ->
      @loadDate = new Date()
      @date = this.modifiedDate()

    modifiedDate: ->
      date = localStorage.getItem(@fName + '.mdate')
      if date? then new Date(parseInt(date.match(/\d+/)[0])) else @loadDate

    load: (fn) ->
      obj = localStorage.getItem(@fName + ".atab")
      obj ?= ""
      @loadDate = new Date()
      fn(obj)
      return

    save: (obj, fn, force=false) ->
      if not force and @modifiedDate().getTime() > @loadDate.getTime()
        e = new Error("This tournament was modified by an external program since we opened it. Make sure it's not open in another ARGO Tabs window")
        e.canForce = "Save anyway"
        throw e
      @loadDate = new Date()
      
      localStorage.setItem(@fName + '.atab', obj)
      localStorage.setItem(@fName + '.mdate', new Date().getTime())

      fn()
      return

    delete: ->
      localStorage.removeItem(@fName + '.atab')
      localStorage.removeItem(@fName + '.mdate')

    rename: (newName) ->
      @load (obj) =>
        @delete()
        @fName = newName
        @save obj, (->), true

    @listFiles: (fn)->
      result = []
      for i in [0...localStorage.length]
        v = localStorage.key(i).match(/^(.*)\.atab$/)
        if (v and v[1])
          result.push(v[1])
      fn(result)
      return

    fileName: ->
      @fName
