define [], ->
  class Source
    constructor: (@backend, @_url) ->
    load: -> throw new Error("load(): Not implemented")
    save: -> throw new Error("save(): Not implemented")
    delete: -> throw new Error("delete(): Not implemented")
    rename: -> throw new Error("rename(): Not implemented")
    canRenae: -> false
    url: -> @_url
    exists: -> true
    fileName: ->
      url = @url()
      return '' if !url
      parsed = url.split('/')
      return '' if !parsed.length
      decodeURIComponent(parsed[parsed.length-1]).replace /\.atab$/, ''
