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
  
  mod.directive 'editableTable', ->
    template: templates.editableTable()
    restrict: 'AE'
    replace: true
    transclude: true
    scope:
      model: '='
      addItem_: '&addItem'
      removeItem_: '&removeItem'
    controller: [ '$scope', ($scope) ->
      this.scope = $scope
      return
    ]

  mod.directive 'editableHeadTransclude', ->
    controller: [ '$transclude', '$element', ($transclude, $element) ->
      $transclude (clone) ->
        lastHeader = clone.find('th:last-child')
        if lastHeader.length
          lastHeader[0].setAttribute('colspan', '2')
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
      scope.noColumns = (hover) ->
        if hover then 1 else 2
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
    compile: (elem, attrs, transcludeFn) ->
      transcludeFn elem, (clone) ->
        $content = $(clone).filter('script').text()
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
        $content += templates.editableTr()
        elem.append $content
        elem.find('td:nth-last-child(2)')[0].setAttribute 'colspan', '{{noColumns(hover)}}'
      return
