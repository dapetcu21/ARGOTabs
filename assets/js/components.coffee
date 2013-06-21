define ['jquery', 'underscore', 'templates', 'angular'], ($) ->
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

  mod.directive "textEditCell", ->
    template: templates.textEditCell()
    scope:
      value: '=textEditBind'
    link: (scope, element) ->
      scope.editing = false

      callback = ->
        scope.$apply ->
          scope.beginEdit()
      element.find('.textedit-label').focus callback

      if element.parent()[0].tagName == 'TD'
        element.parent().click callback

      scope.beginEdit = ->
        return if scope.editing
        scope.editing = true
        input = element.find('input')
        input.blur -> #because angular doesn't know focusout
          scope.$apply ->
            scope.endEdit()
        input.keypress (e) ->
          if e.which == 13
            scope.$apply ->
              scope.endEdit()
        input[0].value = scope.value
        setTimeout ->
          input.focus()
          input.select()
        , 0
      scope.endEdit = ->
        scope.editing = false

  mod.directive "multiCell", ->
    template: templates.multiCell()
    scope:
      value: '=multiBind'
      choiceName: '&multiChoiceName'
      choices: '=multiChoices'
      allowNil: '@multiAllowNil'
    link: (scope, element, attrs) ->
      scope.editing = false

      callback = ->
        scope.$apply ->
          scope.beginEdit()
      element.find('.multi-label').focus callback

      if element.parent()[0].tagName == 'TD'
        element.parent().click callback
      
      scope.beginEdit = ->
        return if scope.editing
        scope.editing = true
        select = element.find('select')
        select.blur ->
          scope.$apply ->
            scope.endEdit()

        setTimeout ->
          select.focus()
        , 0

      scope.endEdit = ->
        scope.editing = false

      scope.getChoiceName = (o) ->
        if o?
          return scope.choiceName
            o: o
        return scope.allowNil

  mod.directive "sortArrow", ->
    template: templates.sortArrow()
    restrict: 'E'
    scope:
      model: '='
      sortBy: '&'
      compareFunction: '&'
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


      scope.toggleSort = ->
        scope.ascending = not scope.ascending
        scope.sort()

  #---- Table ----
  
  mod.directive 'editableTable', ['$parse', ($parse) ->
    template: templates.editableTable()
    restrict: 'AE'
    replace: true
    transclude: true
    scope:
      model: '='
      addItem_: '&addItem'
      removeItem_: '&removeItem'
      visible_: '@visible'
    link:
      post: (scope, element, attrs) ->
        elements = element.find('th').not('.controls')

        n = elements.length

        context = $(templates.editableTcontext
          id: scope.tableId
          n: n
        ).appendTo $('body')

        scope.$on '$destroy', ->
          context.remove()

        element.find('thead').contextmenu
          target: '.context-menu-' + scope.tableId
          before: (e, element, target) ->
            nm = []
            for i in [0...n]
              nm.push 'Row ' + i

            context.find('li.hide-row').each (index, element) ->
              el = $(element)
              i = parseInt el.data 'index'
              el.find('.item-label').html nm[i]
              icon = el.find('i')
              if scope.visible[i]
                icon.removeClass 'icon-check-empty'
                icon.addClass 'icon-check'
              else
                icon.removeClass 'icon-check'
                icon.addClass 'icon-check-empty'
            return true
          onItem: (e, item) ->
            i = parseInt item.data 'index'
            if isNaN(i)
              i = parseInt item.parents('li').data 'index'
            scope.$apply ->
              scope.visible[i] = not scope.visible[i]
              if not _.reduce scope.visible, ((m, i) -> m or i), false
                scope.visible[i] = not scope.visible[i]

        if not scope.visible?
          scope.visible = []
        while scope.visible.length < n
          scope.visible.push true

        scope.$watch 'visible_', (newValue) ->
          p = $parse(newValue)
          ps = scope.$parent
          val = p ps
          console.log newValue, p, val
          if not (val and val instanceof Array) and p.assign
            newArray = []
            p.assign ps, newArray
            val = newArray
            console.log newValue, p(ps), val
          if val
            while val.length < n
              val.push true
            scope.visible = val
          console.log newValue, scope.visible, val, p ps

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
              return 1 if scope.hover
              elements = element.find('th').not('.controls')
              el = elements[i]
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
      
      return
    ]
  ]

  mod.directive 'editableHeadTransclude', ->
    require: '^editableTable'
    link:
      post:
        (scope, element, attrs, controller) ->
          element.find('thead').hover ->
            scope.$apply ->
              scope.hover = true
              scope.headId = 'id' + Math.round( Math.random() * 10000)
              el = element.find('th:visible:last')
              el.addClass('squeezedElement')
              $(templates.editableTh
                id: scope.headId
                tableId: controller.scope.tableId
                width: el.width()
              )
                .appendTo(element.find('thead tr'))
                .find('i.close.icon-cog').click (e) ->
                  setTimeout -> #to avoid the click event that cancels my menu
                    element.find('thead').contextmenu 'show', e
                  , 1
          , ->
            scope.$apply ->
              controller.scope.hover = false
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

        #select the first selectable item
        setTimeout ->
          minItem = null
          minIndex = 1000001
          traverse = (index, el) ->
            return if $(el).css('display') == 'none' or $(el).css('visibility') == 'hidden'
            tabIndex = parseInt(el.getAttribute('tabindex'))
            if isNaN(tabIndex)
              focusable = _.contains ['INPUT', 'TEXTAREA', 'OBJECT', 'BUTTON'], el.tagName
              focusable = focusable or (_.contains(['A', 'AREA'], el.tagName) and el[0].getAttribute('href'))
              tabIndex = if focusable then 0 else -1
            if tabIndex <= 0
              tabIndex = 1000000 - tabIndex
            if tabIndex < minIndex
              minIndex = tabIndex
              minItem = el
            $(el).children().each traverse
          traverse 0, element.find("tr:nth-last-child(2)")[0]

          if minItem
            minItem.focus()
        , 1

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

      (scope, element, attrs, controller) ->
        scope.noColumns = (hover, i) ->
          return 1 if hover
          elements = element.children('td').not('.controls')
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
          scope.hover = true
          scope.id = 'id' + Math.round( Math.random() * 10000)
          el = element.find('td:visible:last')
          el.addClass('squeezedElement')
          $(templates.editableTd
            id: scope.id
            width: el.width()
            tableId: controller.scope.tableId
          ).appendTo(element)
            .find('i.close').click ->
              scope.$apply ->
                scope.removeItem(scope.$index)

        scope.mouseLeave = ->
          scope.hover = false
          element.find('.squeezedElement').removeClass('squeezedElement')
          element.find('#'+scope.id).remove()
