define ['jquery', 'templates', 'underscore'], ($, Templates) ->
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

      el = $(element)
      callback = ->
        scope.$apply ->
          scope.beginEdit()
      el.find('.textedit-label').focus callback

      if el.parent()[0].tagName == 'TD'
        el.parent().click callback

      scope.beginEdit = ->
        return if scope.editing
        scope.editing = true
        input = $(element).find('input')
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
    link: (scope, element, attrs) ->
      attrs.$observe 'multiAllowNil', (value)->
        scope.allowNil = not not value

      scope.editing = false

      el = $(element)
      callback = ->
        scope.$apply ->
          scope.beginEdit()
      el.find('.multi-label').focus callback

      if el.parent()[0].tagName == 'TD'
        el.parent().click callback
      
      scope.beginEdit = ->
        return if scope.editing
        scope.editing = true
        select = $(element).find('select')
        select.blur ->
          scope.$apply ->
            scope.endEdit()

        setTimeout ->
          select.focus()
        , 0

      scope.endEdit = ->
        scope.editing = false

      scope.getChoices = (choices, allowNil) ->
        if allowNil
          return choices.concat([null])
        return choices

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
      
  return
