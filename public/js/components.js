(function() {
  define(['jquery', 'templates', 'underscore'], function($, Templates) {
    var mod;
    mod = angular.module("components", []);
    mod.directive('navLi', function() {
      return {
        restrict: 'E',
        scope: {
          href: '@'
        },
        transclude: true,
        replace: true,
        controller: [
          '$scope', '$location', function($scope, $location) {
            return $scope.$watch(function() {
              return $location.path();
            }, function(newValue, oldValue) {
              return $scope["class"] = newValue === $scope.href ? 'active' : '';
            });
          }
        ],
        template: templates.navLi()
      };
    });
    mod.directive("textEditCell", function() {
      return {
        template: templates.textEditCell(),
        scope: {
          value: '=textEditBind'
        },
        link: function(scope, element) {
          var callback, el;
          scope.editing = false;
          el = $(element);
          callback = function() {
            return scope.$apply(function() {
              return scope.beginEdit();
            });
          };
          el.find('.textedit-label').focus(callback);
          if (el.parent()[0].tagName === 'TD') {
            el.parent().click(callback);
          }
          scope.beginEdit = function() {
            var input;
            if (scope.editing) {
              return;
            }
            scope.editing = true;
            input = $(element).find('input');
            input.blur(function() {
              return scope.$apply(function() {
                return scope.endEdit();
              });
            });
            input.keypress(function(e) {
              if (e.which === 13) {
                return scope.$apply(function() {
                  return scope.endEdit();
                });
              }
            });
            input[0].value = scope.value;
            return setTimeout(function() {
              input.focus();
              return input.select();
            }, 0);
          };
          return scope.endEdit = function() {
            return scope.editing = false;
          };
        }
      };
    });
    mod.directive("multiCell", function() {
      return {
        template: templates.multiCell(),
        scope: {
          value: '=multiBind',
          choiceName: '&multiChoiceName',
          choices: '=multiChoices',
          allowNil: '@multiAllowNil'
        },
        link: function(scope, element, attrs) {
          var callback, el;
          scope.editing = false;
          el = $(element);
          callback = function() {
            return scope.$apply(function() {
              return scope.beginEdit();
            });
          };
          el.find('.multi-label').focus(callback);
          if (el.parent()[0].tagName === 'TD') {
            el.parent().click(callback);
          }
          scope.beginEdit = function() {
            var select;
            if (scope.editing) {
              return;
            }
            scope.editing = true;
            select = $(element).find('select');
            select.blur(function() {
              return scope.$apply(function() {
                return scope.endEdit();
              });
            });
            return setTimeout(function() {
              return select.focus();
            }, 0);
          };
          scope.endEdit = function() {
            return scope.editing = false;
          };
          scope.getChoices = function(choices, allowNil) {
            console.log(choices);
            if (scope.allowNil) {
              return choices.concat([null]);
            }
            return choices;
          };
          scope.getChoiceName = function(o) {
            if (o != null) {
              return scope.choiceName({
                o: o
              });
            }
            return scope.allowNil;
          };
          return scope.nullableClass = function(allowNil) {
            if (allowNil) {
              return 'nullable';
            } else {
              return '';
            }
          };
        }
      };
    });
    mod.directive("sortArrow", function() {
      return {
        template: templates.sortArrow(),
        restrict: 'E',
        scope: {
          model: '=',
          sortBy: '&',
          compareFunction: '&'
        },
        replace: true,
        transclude: true,
        link: function(scope, element) {
          scope.ascending = false;
          scope.sort = function() {
            if (scope.sortBy) {
              scope.model = _.sortBy(scope.model, function(o) {
                return scope.sortBy({
                  o: o
                });
              });
            } else if (scope.compareFunction) {
              scope.model.sort(function(a, b) {
                return scope.compareFunction({
                  a: a,
                  b: b
                });
              });
            }
            if (!scope.ascending) {
              return scope.model.reverse();
            }
          };
          return scope.toggleSort = function() {
            scope.ascending = !scope.ascending;
            return scope.sort();
          };
        }
      };
    });
  });

}).call(this);
