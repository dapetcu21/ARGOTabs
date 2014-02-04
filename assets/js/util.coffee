define ->
  class Util
    @deepCopy: (v, exceptions = []) ->
      aux = {}
      for exp in exceptions
        aux[exp] = eval 'v.' + exp
        eval 'v.' + exp + '=null'
      vv = JSON.parse JSON.stringify v
      for exp in exceptions
        caux = aux[exp]
        eval 'v.' + exp + '=caux'
        eval 'vv.' + exp + '=caux'
      return vv
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

    @arrayRemove: (a, obj) ->
      idx = a.indexOf obj
      if idx != -1
        a.splice idx, 1
      return

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

    @decimalsOf: (v, maxDecimals = 2) ->
      s = v.toFixed maxDecimals
      n = s.length
      dec = maxDecimals
      while n and dec and s[n-1] == '0'
        dec--
        n--
      return dec

    @installScopeUtils: (scope) ->
      scope.yesNoInherit = (v,y,n,i) ->
        if v == null
          i
        else
          if v
            y
          else
            n

      scope.yesNo = (v,y,n) ->
        if v
          y
        else
          n

      scope.parseInt = (s) ->
        return 0 if s == ''
        return parseInt s

      scope.parseFloat = (s) ->
        return 0 if s == ''
        return parseFloat s

      scope.truncFloat = (v, prec) ->
        s = v.toFixed(prec)
        if s.indexOf('.') != -1
          s.replace /\.?0*$/, ''
        else
          s

      scope.toFixed = (v, prec) ->
        v.toFixed prec

      scope.validateMinMax = (v, min, max) ->
        return min <= v and v <= max

      scope.eliminateNil = (a) ->
        if not a?
          return ''
        return a

      scope.namePlaceholder = (a, p='') ->
        if not a?
          return {name: p}
        return a

      scope.nilPlaceholder = (a, p) ->
        if not a?
          return p
        return a

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

    @naturalSort: (a, b) ->
      console.log a, b
      re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi
      sre = /(^[ ]*|[ ]*$)/g
      dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/
      hre = /^0x[0-9a-f]+$/i
      ore = /^0/
      x = a.toString().replace(sre, '') || ''
      y = b.toString().replace(sre, '') || ''
      xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0')
      yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0')
      xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x))
      yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null
      if yD
        return -1 if xD < yD
        return  1 if xD > yD
      for cLoc in [0...Math.max(xN.length, yN.length)]
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0
        if isNaN(oFxNcL) != isNaN(oFyNcL)
          return if isNaN(oFxNcL) then 1 else -1
        else if typeof oFxNcL != typeof oFyNcL
          oFxNcL += ''
          oFyNcL += ''
        return -1 if oFxNcL < oFyNcL
        return  1 if oFxNcL > oFyNcL
      return 0
