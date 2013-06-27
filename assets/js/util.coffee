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

    @safeApply: (scope, fn) ->
      if scope.$$phase or scope.$root.$$phase
        fn()
      else
        scope.$apply fn
      return

    @focusableElement: (element, first = true) ->
      minItem = null
      minIndex = if first then 1000001 else 0
      traverse = (index, el) ->
        return if $(el).css('display') == 'none' or $(el).css('visibility') == 'hidden'
        tabIndex = parseInt(el.getAttribute('tabindex'))
        if isNaN(tabIndex)
          focusable = _.contains ['INPUT', 'TEXTAREA', 'OBJECT', 'BUTTON'], el.tagName
          focusable = focusable or (_.contains(['A', 'AREA'], el.tagName) and el[0].getAttribute('href'))
          tabIndex = if focusable then 0 else -1
        if first and tabIndex <= 0
          tabIndex = 1000000 - tabIndex
        if (if first then tabIndex < minIndex else tabIndex >= minIndex)
          minIndex = tabIndex
          minItem = el
        $(el).children().each traverse
      for el in element
        traverse 0, el
      return minItem

