define ['backend'], (Backend) ->
  class LocalBackend extends Backend
    constructor: (@fileName) ->
      @loadDate = new Date()
      @date = this.modifiedDate()

    modifiedDate: ->
      date = localStorage.getItem(@fileName + '.mdate')
      if date? then new Date(parseInt(date.match(/\d+/)[0])) else @loadDate

    load: (fn) ->
      obj = localStorage.getItem(@fileName + ".atab")
      obj ?= ""
      @loadDate = new Date()
      @date = this.modifiedDate()
      fn(obj)
      return

    save: (obj, fn, force=false) ->
      if not force and @modifiedDate().getTime() > @date.getTime()
        throw new Error("This tournament was modified by an external program since we opened it. Make sure that you don't open the same tournament in another ARGO Tabs window")
      
      localStorage.setItem(@fileName + '.atab', obj)
      localStorage.setItem(@fileName + '.mdate', new Date().getTime())
      fn()
      return

    @listFiles: (fn)->
      result = []
      for i in [0...localStorage.length]
        v = localStorage.key(i).match(/^(.*)\.atab$/)
        if (v and v[1])
          result.push(v[1])
      fn(result)
      return
