(function() {
  define(['jquery', 'underscore', 'templates', 'angular'], function($) {
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
          var callback;
          scope.editing = false;
          callback = function() {
            return scope.$apply(function() {
              return scope.beginEdit();
            });
          };
          element.find('.textedit-label').focus(callback);
          if (element.parent()[0].tagName === 'TD') {
            element.parent().click(callback);
          }
          scope.beginEdit = function() {
            var input;
            if (scope.editing) {
              return;
            }
            scope.editing = true;
            input = element.find('input');
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
          var callback;
          scope.editing = false;
          callback = function() {
            return scope.$apply(function() {
              return scope.beginEdit();
            });
          };
          element.find('.multi-label').focus(callback);
          if (element.parent()[0].tagName === 'TD') {
            element.parent().click(callback);
          }
          scope.beginEdit = function() {
            var select;
            if (scope.editing) {
              return;
            }
            scope.editing = true;
            select = element.find('select');
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
          return scope.getChoiceName = function(o) {
            if (o != null) {
              return scope.choiceName({
                o: o
              });
            }
            return scope.allowNil;
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
    mod.directive('editableTable', function() {
      return {
        template: templates.editableTable(),
        restrict: 'AE',
        replace: true,
        transclude: true,
        scope: {
          model: '=',
          addItem_: '&addItem',
          removeItem_: '&removeItem'
        },
        controller: [
          '$scope', function($scope) {
            this.scope = $scope;
          }
        ]
      };
    });
    mod.directive('editableHeadTransclude', function() {
      return {
        controller: [
          '$transclude', '$element', function($transclude, $element) {
            return $transclude(function(clone) {
              var lastHeader;
              lastHeader = clone.find('th:last-child');
              if (lastHeader.length) {
                lastHeader[0].setAttribute('colspan', '2');
              }
              return $element.append(clone);
            });
          }
        ]
      };
    });
    mod.directive('editableTbody', function() {
      return {
        template: templates.editableTbody(),
        transclude: true,
        restrict: 'AE',
        require: '^editableTable',
        link: function(scope, element, attr, controller) {
          scope.getScope = function() {
            return controller.scope;
          };
          scope.noColumns = function(hover) {
            if (hover) {
              return 1;
            } else {
              return 2;
            }
          };
          scope.removeItem = function(index) {
            var fcn;
            fcn = controller.scope.removeItem_;
            if (fcn) {
              return fcn({
                index: index
              });
            } else {
              return controller.scope.model.splice(index, 1);
            }
          };
          scope.$watch(function() {
            return attr.addItemLabel;
          }, function() {
            return scope.addLabel = attr.addItemLabel;
          });
          return scope.addItem = function() {
            controller.scope.addItem_();
            return setTimeout(function() {
              var minIndex, minItem, traverse;
              minItem = null;
              minIndex = 1000001;
              traverse = function(index, el) {
                var focusable, tabIndex;
                if ($(el).css('display') === 'none' || $(el).css('visibility') === 'hidden') {
                  return;
                }
                tabIndex = parseInt(el.getAttribute('tabindex'));
                if (isNaN(tabIndex)) {
                  focusable = _.contains(['INPUT', 'TEXTAREA', 'OBJECT', 'BUTTON'], el.tagName);
                  focusable = focusable || (_.contains(['A', 'AREA'], el.tagName) && el[0].getAttribute('href'));
                  tabIndex = focusable ? 0 : -1;
                }
                if (tabIndex <= 0) {
                  tabIndex = 1000000 - tabIndex;
                }
                if (tabIndex < minIndex) {
                  minIndex = tabIndex;
                  minItem = el;
                }
                return $(el).children().each(traverse);
              };
              traverse(0, element.find("tr:nth-last-child(2)")[0]);
              if (minItem) {
                return minItem.focus();
              }
            }, 1);
          };
        }
      };
    });
    return mod.directive('editableScriptTransclude', function() {
      return {
        compile: function(elem, attrs, transcludeFn) {
          transcludeFn(elem, function(clone) {
            var $content;
            $content = $(clone).filter('script').text().replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
            $content += templates.editableTr();
            elem.append($content);
            return elem.find('td:nth-last-child(2)')[0].setAttribute('colspan', '{{noColumns(hover)}}');
          });
        }
      };
    });
  });

}).call(this);
