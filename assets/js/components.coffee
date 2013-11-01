define ['jquery', 'util', 'underscore', 'templates', 'angular', 'jquery.event.drag', 'html2canvas'], ($, Util) ->
  mod = angular.module "components", []
  mod.directive 'navLi', ->
    restrict: 'E'
    scope:
      href: '@'
    transclude: true
    replace: true
    controller: ['$scope', '$location', ($scope, $location) ->
      $scope.$watch ->
        $location.path()
      , (newValue, oldValue) ->
        $scope.class = if (newValue == $scope.href) then 'active' else ''
    ]
    template: templates.navLi()

  mod.directive "sorterCriteria", [->
    template: templates.sorterCriteria()
    restrict: 'E'
    scope:
      model: '=bind'
  ]

  mod.directive "tristateCheckbox", ['$parse', ($parse) ->
    link: (scope, element, attrs) ->
      scope.$watch ->
        $parse(attrs["tristateCheckbox"])(scope)
      , (v) ->
        if v == null
          element.prop 'indeterminate', true
          element.prop 'checked', true
        else
          element.prop 'indeterminate', false
          element.prop 'checked', v
      element.bind 'change', ->
        model = $parse(attrs["tristateCheckbox"])
        indet = element.prop 'indeterminate'
        check = element.prop 'checked'
        if not indet and not check and model(scope)
          element.prop 'indeterminate', indet = true
          element.prop 'checked', check = true
        scope.$apply ->
          if indet
            model.assign scope, null
          else
            model.assign scope, check
  ]

  mod.directive "textEditCell", ['$parse', ($parse) ->
    template: templates.textEditCell()
    restrict: 'E'
    scope:
      extra: '@'
      minWidth: '@inputWidth'
      pattern: '@pattern'
      validator: '&'
      softValidator: '&'
      getter: '&'
      setter: '&'
      valid: '='
    replace: true
    transclude: true
    link: (scope, element, attrs) ->
      scope.editing = false
      label = element.find('.textedit-label')
      input = element.find('input')

      scope.$watch ->
        if not attrs.softValidator?
          true
        else
          scope.softValidator {o: $parse(attrs.bind) scope.$parent}
      , (valid) ->
        if attrs.valid?
          scope.valid = valid
        if valid
          scope.labelClass = 'valid'
          scope.inputClass = ''
        else
          scope.labelClass = 'invalid'
          scope.inputClass = 'error'

      scope.$watch ->
        $parse(attrs.bind)(scope.$parent)
      , (newValue) ->
        if attrs.getter?
          scope.valueParsed = scope.getter {o: newValue}
        else
          scope.valueParsed = newValue
      scope.$watch 'valueParsed', (newValue, oldValue) ->
        nv = if attrs.setter?
          scope.setter {o: newValue}
        else
          newValue
        if (scope.pattern and typeof(newValue) == 'string' and not newValue.match(new RegExp '^' + scope.pattern + '$')) or
           (attrs.validator? and not scope.validator {o: nv})
          scope.valueParsed = oldValue
        else
          $parse(attrs.bind).assign scope.$parent, nv

      scope.$watch ->
        attrs.editing
      , (newValue, oldValue) ->
        if newValue?
          if newValue and not oldValue
            scope.beginEdit()
          else if not newValue and oldValue
            scope.endEdit()

      scope.$watch (-> not attrs.enabled? or scope.$parent.$eval(attrs.enabled)), (n, o) ->
        scope._enabled = n
        if n
          label[0].tabIndex = 0
        else
          label[0].removeAttribute 'tabIndex'

      scope.beginEdit_ = ->
        if not attrs.editing? and scope._enabled
          scope.beginEdit()

      focusCallback = ->
        Util.safeApply scope, scope.beginEdit_
      defocusCallback = ->
        Util.safeApply scope, ->
          if not attrs.editing?
            scope.endEdit()

      label.focus focusCallback
      if element.parent()[0].tagName == 'TD'
        element.parent().click focusCallback

      input.blur defocusCallback
      input.keypress (e) ->
        if e.which == 13
          defocusCallback()

      scope.beginEdit = ->
        return if scope.editing
        scope.editing = true

        minW = parseInt scope.minWidth
        if isNaN minW
          minW = 100
        rw = label.outerWidth()
        if minW > rw
          rw = minW
        input.css 'width', rw

        setTimeout ->
          input.focus()
          input.select()
        , 0
      scope.endEdit = ->
        scope.editing = false

      if attrs.editing
        scope.beginEdit()
  ]

  mod.directive "multiCell", ->
    template: templates.multiCell()
    restrict: 'E'
    scope:
      value: '=bind'
      choiceName: '&choiceName'
      choices: '=choices'
      allowNil: '@nilPlaceholder'
      minWidth: '@inputWidth'
    replace: true
    transclude: true
    compile: (element, attrs, transclude) ->
      if not attrs.nilPlaceholder
        element.find('option').remove()
      (scope, element, attrs) ->
        scope.editing = false
        select = element.find('select')
        label = element.find('.multi-label')

        callback = ->
          Util.safeApply scope, ->
            scope.beginEdit()
        label.focus callback

        if element.parent()[0].tagName == 'TD'
          element.parent().click callback

        select.blur ->
          Util.safeApply scope, ->
            scope.endEdit()
        
        scope.beginEdit = ->
          return if scope.editing or not scope._enabled
          scope.editing = true

          minW = parseInt scope.minWidth
          if isNaN minW
            minW = 100
          rw = label.outerWidth()
          if minW > rw
            rw = minW
          select.css 'width', rw

          setTimeout ->
            select.focus()
          , 0

        scope.endEdit = ->
          scope.editing = false

        scope.$watch (-> not attrs.enabled? or scope.$parent.$eval(attrs.enabled)), (n, o) ->
          scope._enabled = n
          if n
            label[0].tabIndex = 0
          else
            label[0].removeAttribute 'tabIndex'

        scope.getChoiceName = (o) ->
          if o?
            return scope.choiceName
              o: o
          return scope.allowNil

  mod.directive "hlistCell", ['$parse', ($parse)->
    template: templates.hlistCell()
    restrict: 'E'
    scope:
      model: '=bind'
      addItem: '&addItem'
      removeItem: '&removeItem'
      editHidden: '=editHidden'
      separator: '@separator'
      reorders: '&reorders'
      reordersAlways: '@reordersAlways'
      userdata: '&userdata'
      dropGroup: '@dropGroup'
      groupTest: '&groupTest'
      dropTest: '&dropTest' #not implemented
      manualMove: '&manualMove'
      extensionElement: '@'
      extensionElementLast: '@'
    transclude: true
    link: (scope, element, attrs) ->
      scope.edit = false
      scope.remove = (index) ->
        scope.removeItem
          index: index
        if not scope.model.length
          scope.edit = false
      scope.add = ->
        scope.addItem()
        setTimeout ->
          if item = Util.focusableElement element.find('.item'), false
            item.focus()
        , 1
      scope.comma = (show) ->
        if show
          ','
        else
          ''
      scope.$watch (-> attrs.dropGroup?), (v) -> scope.hasGroup = v
      scope.$watch (-> attrs.addItem?), (v) -> scope.canAddItem = v
      scope.$watch (-> attrs.reorders? && scope.reorders(scope.$parent)), (v) ->
        scope._reorders = v

      currentPoint = null
      dragElement = null
      $canvas = null
      $line = null
      dragPointX = dragPointY = 0
      dragStart = null

      buildRectangleList = ->
        rl = scope.rectangleList = []

        makeInstance = (s) -> {ud:s.userdata(), model: s.model}
        scope.fromInstance = fromInstance = makeInstance scope

        if not attrs.dropGroup?
          lists = [element[0]]
        else
          lists = $ 'hlist-cell'

        for list in lists
          sc = $(list).scope()
          instance = if sc == scope then fromInstance else makeInstance sc
          continue if attrs.dropGroup? and sc.dropGroup != scope.dropGroup
          continue if attrs.groupTest? and not scope.groupTest({fromList: fromInstance, toList:instance})

          init = rl.length

          items = $(list).find('.item')
          if not items.length
            items.push $(list).find('.placeholder')[0]

          for item, i in items
            $item = $ item
            offs = $item.offset()
            rl.push
              top: offs.top
              left: offs.left
              width: $item.outerWidth()
              height: $item.outerHeight()
              index: i
              instance: instance

          init = rl[init]
          lastIndex = rl.length - 1
          last = rl[lastIndex]

          if $(items[0]).hasClass('placeholder')
            init.empty = true

          if sc.extensionElement? and sc.extensionElement != ""
            a = $(sc.extensionElement)
            for item in a
              $item = $ item
              offs = $item.offset()
              rl.push
                top: offs.top
                left: offs.left
                width: $item.outerWidth()
                height: $item.outerHeight()
                lineTop: init.top
                lineLeft: init.left
                lineHeight: init.height
                empty: true
                index: 0
                instance: instance

          if sc.extensionElementLast? and sc.extensionElementLast != ""
            a = $(sc.extensionElementLast)
            for item in a
              $item = $ item
              offs = $item.offset()
              left = if last.empty then last.left else last.left + last.width
              rl.push
                top: offs.top
                left: offs.left
                width: $item.outerWidth()
                height: $item.outerHeight()
                lineTop: last.top
                lineLeft: left
                lineHeight: last.height
                empty: true
                index: lastIndex
                instance: instance

      getCurrentPoint = (x,y) ->
        for rect in scope.rectangleList
          w = rect.width
          h = rect.height
          t = rect.top
          l = rect.left
          continue if y < t or y > t + h or x < l or x > l + w
          m = if rect.empty then l + w else l + w/2
          r =
            x: if x < m then l else l + w
            y: t
            height: h
            index: rect.index + (if x < m then 0 else 1)
            instance: rect.instance
          if rect.lineTop?
            r.y = rect.lineTop
          if rect.lineLeft?
            r.x = rect.lineLeft
          if rect.lineHeight?
            r.height = rect.lineHeight
          return r
        return null

      updateCanvas = (e) ->
        if $canvas
          $canvas.css 'left', e.pageX - dragPointX
          $canvas.css 'top', e.pageY - dragPointY
        if $line
          pnt = getCurrentPoint e.pageX, e.pageY
          if pnt and pnt.instance == scope.fromInstance and (pnt.index == dragStart or pnt.index == dragStart+1)
            pnt = null
          if currentPoint and not pnt
            $line.css 'display', 'none'
          else if pnt and not currentPoint
            $line.css 'display', 'block'
          if pnt
            $line.css 'left', pnt.x + 'px'
            $line.css 'top', pnt.y + 'px'
            $line.css 'height', pnt.height + 'px'
          currentPoint = pnt

      element.on 'draginit', (e) ->
        el = $(e.target)
        dragElement = null
        if el.hasClass 'moveable-true'
          dragElement = el
        else if (a = el.parents('.moveable-true')).length
          dragElement = a
        if dragElement
          return element
        return false

      element.on 'dragstart', (e) ->
        dragStart = dragElement.index()
        scrollX = window.pageXOffset
        scrollY = window.pageYOffset
        buildRectangleList()
        html2canvas dragElement[0],
          scale: if window.devicePixelRatio then window.devicePixelRatio else 1
          onrendered: (canvas) ->
            window.scrollTo scrollX, scrollY
            elW = dragElement.outerWidth()
            elH = dragElement.outerHeight()
            scale =
              x: canvas.width / elW
              y: canvas.height / elH

            $canvas = $(canvas)
            $canvas.css 'width', elW
            $canvas.css 'height', elH
            $canvas.css 'position', 'absolute'
            $canvas.css 'opacity', '0.6'

            offs = dragElement.offset()
            dragPointX = e.pageX - offs.left
            dragPointY = e.pageY - offs.top
            dragElement.css 'opacity', '0.4'

            $line = $(document.createElement 'div')
            $line.css 'position', 'absolute'
            $line.css 'border', '1px solid #0088cc'
            $line.css 'border-radius', '1px'
            $line.css 'width', '0px'
            $line.css 'height', '0px'
            $line.css 'display', 'none'

            $(document.body).append $line
            $(document.body).append $canvas

            updateCanvas e
            return
        return dragElement

      element.on 'drag', {distance: 2}, (e) ->
        updateCanvas e
        return

      element.on 'dragend', (e) ->
        if $canvas
          $canvas.remove()
          $canvas = null
        dragElement.css 'opacity', '1'
        if $line
          $line.remove()
          $line = null
        if currentPoint
          if attrs.manualMove?
            Util.safeApply scope, ->
              scope.manualMove
                fromList: scope.fromInstance
                toList: currentPoint.instance
                fromIndex: dragStart
                toIndex: currentPoint.index
          else
            idx = currentPoint.index
            same = currentPoint == scope.fromInstance
            idx-- if same and idx > dragStart
            if not same or idx != dragStart
              Util.safeApply scope, ->
                el = scope.model.splice(dragStart, 1)[0]
                currentPoint.instance.model.splice idx, 0, el
        return
  ]


