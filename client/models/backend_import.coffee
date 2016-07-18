_ = require 'lodash'

class Backend
  list: ->
  load: -> throw new Error("load(): Not implemented")

  @list: (fn) ->
    _.each Backend.backends, (b) ->
      b.list(fn)
    return

  @load: (url) ->
    Backend.backendForUrl(url).load(url)

  @backendForSchema: (schema) ->
    for b in Backend.backends
      if _.includes b.schemas(), schema
        return b
    return null

  @backendForUrl: (url) ->
    schema = url.replace /:.*$/, ''
    Backend.backendForSchema(schema)

module.exports = Backend
