define ['jquery', 'util', 'B64', 'underscore', 'templates', 'angular', 'jquery.event.drag', 'jquery.bootstrap.contextmenu', 'html2canvas'], ($, Util, B64) ->
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

      scope.$watch (-> attrs.addItem?), (v) -> scope.canAddItem = v
      scope.$watch (-> attrs.reorders? && scope.reorders(scope.$parent)), (v) ->
        scope._reorders = v

      currentPoint = null
      dragElement = null
      $canvas = null
      $line = null
      dragPointX = dragPointY = 0
      dragStart = null

      getCurrentPoint = (x,y) ->
        items = element.find('.item')
        for item, i in items
          $item = $(item)
          offs = $item.offset()
          w = $item.outerWidth()
          h = $item.outerHeight()
          continue if y < offs.top or y > offs.top + h or x < offs.left or x > offs.left + w
          m = offs.left + w/2
          return {
            x: if x < m then offs.left else offs.left + w
            y: offs.top
            height: h
            index: if x < m then i else i + 1
          }
        return null

      updateCanvas = (e) ->
        if $canvas
          $canvas.css 'left', e.pageX - dragPointX
          $canvas.css 'top', e.pageY - dragPointY
        if $line
          pnt = getCurrentPoint e.pageX, e.pageY
          if pnt and (pnt.index == dragStart or pnt.index == dragStart+1)
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
          idx = currentPoint.index
          idx-- if idx > dragStart
          if idx != dragStart
            Util.safeApply scope, ->
              arr = scope.model
              el = arr.splice(dragStart, 1)[0]
              arr.splice idx, 0, el
        return
  ]

  mod.directive "sortArrow", ->
    template: templates.sortArrow()
    restrict: 'E'
    scope:
      model: '='
      sortBy: '&'
      compareFunction: '&'
      hideArrows: '@'
    replace: true
    transclude: true
    link: (scope, element) ->
      scope.ascending = false

      scope.sort = ->
        if scope.sortBy
          scope.model = _.sortBy scope.model, (o)->
            scope.sortBy
              o: o
        else if scope.compareFunction
          scope.model.sort (a, b)->
            scope.compareFunction
              a: a
              b: b
        if not scope.ascending
          scope.model.reverse()

      scope.elementToString = (el) ->
        if el.hasClass('sortarrow')
          return elementToString element.find('.sortarrow-content')
        return false

      scope.toggleSort = ->
        scope.ascending = not scope.ascending
        scope.sort()

  #---- Table ----

  elementToString = (element, visible = false) ->
    return '' if element.hasClass('dont-export') or (visible and element.css('display') == 'none')
    scope = angular.element(element).scope()
    if scope.elementToString
      r = scope.elementToString element, visible
      if r or typeof(r) == 'string'
        return r
    first = false
    r = ''
    element.children().each ->
      nw = elementToString $(this), visible
      if nw
        r += ' ' if first
        r += nw
        first = true
    if not first
      return element.text()
    return r

  serializeTr = (element, visible = false) ->
    arr = []
    element.children().each ->
      $this = $(this)
      return if $this.hasClass 'dont-export'
      return if this.tagName != 'TD' and this.tagName != 'TH'
      return if visible and $this.css('display') == 'none'
      arr.push elementToString $this, visible
    return arr
  
  mod.directive 'editableTable', ['$parse', ($parse) ->
    template: templates.editableTable()
    restrict: 'AE'
    replace: true
    transclude: true
    scope:
      model: '='
      addItem_: '&addItem'
      removeItem_: '&removeItem'
      canRemoveItem_: '&canRemoveItem'
      visible_: '@visible'
      reorders: '@reorders'
      tableClass_: '@tableClass'
      rowClicked_: '&rowClicked'
    link:
      post: (scope, element, attrs) ->
        elements = element.find('th').not('.controls')

        n = elements.length

        context = $(templates.editableTcontext
          id: scope.tableId
          n: n
        ).appendTo $('body')

        scope.$watch ->
          attrs.showGear
        , (value) ->
          scope.showGear = if value? then $parse(value) scope.$parent else true

        scope.$watch ->
          attrs.tableClass
        , (value) ->
          scope.tableClass = if value? then value else 'table table-striped table-bordered'

        scope.$on '$destroy', ->
          context.remove()

        scope.canRemoveItem = (o) ->
          if not attrs.canRemoveItem?
            return attrs.removeItem?
          return scope.canRemoveItem_
            o: o

        exportCSV = ->
          csv = []
          element.find('tr').each ->
            $this = $(this)
            return if $this.hasClass 'dont-export'
            csv.push serializeTr $this, true
          txt = ''
          for row, i in csv
            txt += '\r\n' if i
            for cell, j in row
              txt += ',' if j
              txt += '"' + cell.replace(/"/g, '""') + '"'
          data = B64.encode txt
          link = $('<a id="downloader" download="table.csv" href="data:application/octet-stream;base64,' + data + '"></a>')
            .appendTo $("body")
          link[0].click()
          link.remove()

        element.find('thead').contextmenu
          target: '.context-menu-' + scope.tableId
          before: (e, element, target) ->
            nm = serializeTr element.find('tr')
            context.find('li.hide-row').each (index, element) ->
              el = $(element)
              i = parseInt el.data 'index'
              el.find('.item-label').html nm[i]
              icon = el.find('i')
              if scope.visible[i]
                icon.removeClass 'fa-square-o'
                icon.addClass 'fa-check-square-o'
              else
                icon.removeClass 'fa-check-square-o'
                icon.addClass 'fa-square-o'
            return true
          onItem: (e, item) ->
            i = parseInt item.data 'index'
            if isNaN(i)
              i = parseInt item.parents('li').data 'index'
            if not isNaN(i)
              Util.safeApply scope, ->
                scope.visible[i] = not scope.visible[i]
                if not _.reduce scope.visible, ((m, i) -> m or i), false
                  scope.visible[i] = not scope.visible[i]
            else
              if item.hasClass('export-csv') or item.parents('.export-csv')
                exportCSV()

        if not scope.visible?
          scope.visible = []
        while scope.visible.length < n
          scope.visible.push true

        scope.$watch 'visible_', (newValue) ->
          p = $parse(newValue)
          ps = scope.$parent
          val = p ps
          if not (val and val instanceof Array) and p.assign
            newArray = []
            p.assign ps, newArray
            val = newArray
          if val
            while val.length < n
              val.push true
            scope.visible = val

        scope.clearAutoCell = (elements) ->
          if scope.auto != null
            $(elements[scope.auto]).removeClass 'a-width'
          scope.auto = null

        scope.updateAutoCell = (elements) ->
          min = 1000001
          auto = null
          for em, i in elements
            continue if not scope.visible[i]
            el = $(em)
            if el.hasClass('auto-width')
              auto = null
              break
            prior = el.data('autoIndex')
            if isNaN prior
              prior = 1000000 - el.width()
            if prior < min
              min = prior
              auto = i
          if auto != null
            $(elements[auto]).addClass 'a-width'
          scope.auto = auto

        for el, i in elements
          ((i, el) ->
            scope.$watch 'visible['+i+']', (newValue, oldValue) ->
              es = element.find('th').not('.controls')
              scope.clearAutoCell es
              scope.updateAutoCell es
              if newValue
                $(el).removeClass 'hidden-true'
              else
                $(el).addClass 'hidden-true'
              
            scope.$watch ->
              return 1 if !scope.rowHovered
              return 1 if scope.hover
              return 1 if $(el).css('display') == 'none'
              for j in [i+1...elements.length]
                if $(elements[j]).css('display') != 'none'
                  return 1
              return 2
            , (newValue) ->
              el.setAttribute('colspan', newValue)
          )(i, el)
    controller: [ '$scope', '$element', ($scope, $element) ->
      this.scope = $scope
      $scope.tableId = 'tid' + Math.round( Math.random() * 10000 )
      $scope.hover = false
      $scope.rowHovered = 0
      
      return
    ]
  ]

  mod.directive 'editableHeadTransclude', ->
    require: '^editableTable'
    link:
      post:
        (scope, element, attrs) ->
          element.find('thead').hover ->
            Util.safeApply scope, ->
              return if not scope.showGear
              scope.hover = true
              scope.rowHovered++
              scope.headId = 'id' + Math.round( Math.random() * 10000)
              el = element.find('th:visible:last')
              console.log el.width()
              el.addClass('squeezedElement')
              $(templates.editableTh
                id: scope.headId
                tableId: scope.tableId
                width: el.width()
              )
                .appendTo(element.find('thead tr'))
                .find('i.close.icon-cog').click (e) ->
                  setTimeout -> #to avoid the click event that cancels my menu
                    element.find('thead').contextmenu 'show', e
                  , 1
          , ->
            Util.safeApply scope, ->
              return if not scope.hover
              scope.hover = false
              scope.rowHovered--
              element.find('.controls').hide()
              element.find('.squeezedElement').removeClass('squeezedElement')
              element.find('#'+scope.headId).remove()

    controller: [ '$transclude', '$element', ($transclude, $element) ->
      $transclude (clone) ->
        $element.append(clone)
    ]

  mod.directive 'editableTbody', ->
    template: templates.editableTbody()
    transclude: true
    restrict: 'AE'
    require: '^editableTable'
    link: (scope, element, attr, controller) ->
      scope.getScope = ->
        controller.scope

      scope.removeItem = (index) ->
        fcn = controller.scope.removeItem_
        if fcn
          fcn
            index: index
        else
          controller.scope.model.splice(index, 1)

      scope.$watch ->
        attr.addItemLabel
      , ->
        scope.addLabel = attr.addItemLabel

      scope.addItem = ->
        controller.scope.addItem_()
        setTimeout ->
          if item = Util.focusableElement element.find("tr:nth-last-child(2)")
            item.focus()
        , 1

      scope.rowClicked = ($index) ->
        controller.scope.rowClicked_
          $index: $index

  mod.directive 'editableScriptTransclude', ->
    require: '^editableTable'
    compile: (element, attrs, transcludeFn) ->
      transcludeFn element, (clone) ->
        $content = $(clone).filter('script').text()
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
        element.append $content

        elements = element.children('td').not('.controls')
        for el, i in elements
          el.setAttribute 'colspan', '{{noColumns(hover, '+i+')}}'
          $(el).addClass 'hidden-{{!visible('+i+')}}'

      post: (scope, element, attrs, controller) ->
        elements = element.children('td').not('.controls')

        scope.noColumns = (hover, i) ->
          return 1 if hover
          return 1 if !controller.scope.rowHovered
          el = elements[i]
          return 1 if $(el).css('display') == 'none'
          for j in [i+1...elements.length]
            if $(elements[j]).css('display') != 'none'
              return 1
          return 2

        scope.visible = (i) ->
          try
            controller.scope.visible[i]
          catch
            true

        scope.mouseEnter = ->
          return if scope.hover
          return if not controller.scope.canRemoveItem scope.o
          scope.hover = true
          controller.scope.rowHovered++
          scope.id = 'id' + Math.round( Math.random() * 10000)
          el = element.find('td:visible:last')
          el.addClass('squeezedElement')
          $(templates.editableTd
            id: scope.id
            width: el.width()
            tableId: controller.scope.tableId
          ).appendTo(element)
            .find('i.close').click ->
              Util.safeApply scope, ->
                scope.removeItem(scope.$index)

        scope.mouseLeave = ->
          return if not scope.hover
          scope.hover = false
          controller.scope.rowHovered--
          element.find('.squeezedElement').removeClass('squeezedElement')
          element.find('#'+scope.id).remove()

        currentPoint = null
        getCurrentPoint = (x, y) ->
          parent = element.parent()
          rows = parent.children()
          n = rows.length - 1
          return null if not n
          lel = $(rows[n-1])
          lelbt = lel.offset().top + lel.outerHeight()
          return null if y > lelbt + 10
          po = parent.offset()
          return null if y < po.top - 10
          return null if x < po.left or x > po.left + parent.outerWidth()
          a = 0
          b = n
          while a < b
            m = (a+b) >> 1
            el = $(rows[m])
            if y < el.offset().top + el.outerHeight() / 2
              b = m
            else
              a = m+1
          return {
            index: b
            y: if b == n then lelbt else $(rows[b]).offset().top
          }

        $canvas = null
        $line = null
        dragPointX = dragPointY = 0
        dragStart = null
        updateCanvas = (e) ->
          if $canvas
            $canvas.css 'left', e.pageX - dragPointX
            $canvas.css 'top', e.pageY - dragPointY
          if $line
            pnt = getCurrentPoint e.pageX, e.pageY
            if pnt and (pnt.index == dragStart or pnt.index == dragStart+1)
              pnt = null
            if currentPoint and not pnt
              $line.css 'display', 'none'
            else if pnt and not currentPoint
              $line.css 'display', 'block'
            if pnt
              $line.css 'top', pnt.y + 'px'
            currentPoint = pnt

        sc = controller.scope
        element.on 'draginit', (e) ->
          return false if not sc.reorders
          return element
        element.on 'dragstart', (e) ->
          return false if not sc.reorders
          table = element.parents('table')
          dragStart = element.index()

          scrollX = window.pageXOffset
          scrollY = window.pageYOffset
          html2canvas element[0],
            scale: if window.devicePixelRatio then window.devicePixelRatio else 1 #if only this actually worked
            onrendered: (fullCanvas) ->
              window.scrollTo scrollX, scrollY

              #remove borders
              fullContex = fullCanvas.getContext('2d')
              parseIntN = (s) ->
                n = parseInt s
                return 0 if isNaN n
                return n
              td = element.find('td:visible')
              borders =
                left: parseIntN(td.css 'border-left-width') +
                      parseIntN(element.css 'border-left-width')
                right: parseIntN(td.last().css 'border-right-width') +
                       parseIntN(element.css 'border-right-width')
                top: parseIntN(td.css 'border-top-width') +
                     parseIntN(element.css 'border-top-width')
                bottom: parseIntN(td.css 'border-bottom-width') +
                        parseIntN(element.css 'border-bottom-width')
              pos = element.offset()
              elW = element.outerWidth()
              elH = element.outerHeight()
              scale =
                x: fullCanvas.width / elW
                y: fullCanvas.height / elH
              css =
                width: elW - borders.left - borders.right
                height: elH - borders.top - borders.bottom
              pos.left = borders.left * scale.x
              pos.top = borders.top * scale.y
              pos.width = css.width * scale.x
              pos.height = css.height * scale.y

              canvas = document.createElement 'canvas'
              $canvas = $(canvas)
              $canvas.attr 'width', pos.width
              $canvas.attr 'height', pos.height
              $canvas.css 'width', css.width
              $canvas.css 'height', css.height
              canvas.getContext('2d').drawImage fullCanvas, -pos.left, -pos.top

              $canvas.css 'border', '1px solid #dddddd' #add our own borders
              $canvas.css 'position', 'absolute'
              $canvas.css 'opacity', '0.6'
              offs = element.offset()
              dragPointX = e.pageX - offs.left
              dragPointY = e.pageY - offs.top
              element.css 'opacity', '0.4'

              $line = $(document.createElement 'div')
              $line.css 'position', 'absolute'
              $line.css 'border', '1px solid #0088cc'
              $line.css 'border-radius', '1px'
              $line.css 'width', element.outerWidth()
              $line.css 'left', element.offset().left
              $line.css 'display', 'none'

              updateCanvas e
              $(document.body).append $line
              $(document.body).append $canvas

              return
          return $line
        element.on 'drag', {distance: 4}, (e) ->
          updateCanvas e
          return
        element.on 'dragend', (e) ->
          if $canvas
            $canvas.remove()
            $canvas = null
          element.css 'opacity', '1'
          if $line
            $line.remove()
            $line = null
          if sc.reorders and currentPoint
            idx = currentPoint.index
            idx-- if idx > dragStart
            if idx != dragStart
              Util.safeApply sc, ->
                arr = sc.model
                el = arr.splice(dragStart, 1)[0]
                arr.splice idx, 0, el
          return
