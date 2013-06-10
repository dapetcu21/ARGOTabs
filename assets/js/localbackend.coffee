define ['backend'], (Backend) ->
  console.log "ia pula"
  class LocalBackend extends Backend
    constructor: (@fileName) ->

    modifiedDate: ->
      date = localStorage.getItem(@fileName + '.mdate')
      if date? then new Date(parseInt(date.start.match(/\d+/)[0], 10)) else new Date()

    load: (fn) ->
      obj = localStorage.getItem(@fileName + ".atab")
      @date = this.modifiedDate()
      fn(obj)
      return

    save: (obj, fn, force=true) ->
      if not force and this.modifiedDate().getTime() > @date.getTime()
        throw new Error("This tournament was modified by an external program. Make sure that you don't open the same tournament in another ARGO Tabs window")
      
      localStorage.setItem(@fileName + '.atab', obj)
      localStorage.setItem(@fileName + '.mdate', new Date().toJSON())
      fn()
      return

