define ['jquery'], ($) ->
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
    template: "<li class='{{class}}'><a href=\"{{'#' + href}}\" ng-transclude></a></li>"

  mod.directive "textEditCell", ->
    templateUrl: 'partials/texteditcell.html'
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

  return
