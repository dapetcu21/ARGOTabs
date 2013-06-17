define ->
  class Util
    @unpackCycles: (a, index) ->
      for v, i in a
        if typeof(v) == 'number'
          a[i] = index[v]
      return
    
    @unpackCycle: (a, index) ->
      if typeof(a) == 'number'
        try
          return index[a]
        catch
          return null
      return null

    @packCycle: (a, index) ->
      index.indexOf a

    @packCycles: (a, index) ->
      r = []
      for v in a
        r.push index.indexOf(v)
      r

    @getObjectClass: (obj) ->
      if obj and obj.constructor and obj.constructor.toString
        arr = obj.constructor.toString().match /function\s*(\w+)/
        if arr and arr.length == 2
          return arr[1]
      undefined

    @getClass: (constructor) ->
      if constructor and constructor.toString
        arr = constructor.toString().match /function\s*(\w+)/
        if arr and arr.length == 2
          return arr[1]
      undefined

    @copyObject: (orig, ignores) ->
      ignores ?= []
      ignores.push '$$hashKey'
      model = {}
      for key, value of orig
        model[key] = value
      for key in ignores
        model[key] = undefined
      return model
