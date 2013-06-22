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
    mod.directive('editableTable', [
      '$parse', function($parse) {
        return {
          template: templates.editableTable(),
          restrict: 'AE',
          replace: true,
          transclude: true,
          scope: {
            model: '=',
            addItem_: '&addItem',
            removeItem_: '&removeItem',
            visible_: '@visible'
          },
          link: {
            post: function(scope, element, attrs) {
              var context, el, elements, i, n, _i, _len, _results;
              elements = element.find('th').not('.controls');
              n = elements.length;
              context = $(templates.editableTcontext({
                id: scope.tableId,
                n: n
              })).appendTo($('body'));
              scope.$on('$destroy', function() {
                return context.remove();
              });
              element.find('thead').contextmenu({
                target: '.context-menu-' + scope.tableId,
                before: function(e, element, target) {
                  var i, nm, _i;
                  nm = [];
                  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
                    nm.push('Row ' + i);
                  }
                  context.find('li.hide-row').each(function(index, element) {
                    var el, icon;
                    el = $(element);
                    i = parseInt(el.data('index'));
                    el.find('.item-label').html(nm[i]);
                    icon = el.find('i');
                    if (scope.visible[i]) {
                      icon.removeClass('icon-check-empty');
                      return icon.addClass('icon-check');
                    } else {
                      icon.removeClass('icon-check');
                      return icon.addClass('icon-check-empty');
                    }
                  });
                  return true;
                },
                onItem: function(e, item) {
                  var i;
                  i = parseInt(item.data('index'));
                  if (isNaN(i)) {
                    i = parseInt(item.parents('li').data('index'));
                  }
                  return scope.$apply(function() {
                    scope.visible[i] = !scope.visible[i];
                    if (!_.reduce(scope.visible, (function(m, i) {
                      return m || i;
                    }), false)) {
                      return scope.visible[i] = !scope.visible[i];
                    }
                  });
                }
              });
              if (scope.visible == null) {
                scope.visible = [];
              }
              while (scope.visible.length < n) {
                scope.visible.push(true);
              }
              scope.$watch('visible_', function(newValue) {
                var newArray, p, ps, val;
                p = $parse(newValue);
                ps = scope.$parent;
                val = p(ps);
                console.log(newValue, p, val);
                if (!(val && val instanceof Array) && p.assign) {
                  newArray = [];
                  p.assign(ps, newArray);
                  val = newArray;
                  console.log(newValue, p(ps), val);
                }
                if (val) {
                  while (val.length < n) {
                    val.push(true);
                  }
                  scope.visible = val;
                }
                return console.log(newValue, scope.visible, val, p(ps));
              });
              scope.clearAutoCell = function(elements) {
                if (scope.auto !== null) {
                  $(elements[scope.auto]).removeClass('a-width');
                }
                return scope.auto = null;
              };
              scope.updateAutoCell = function(elements) {
                var auto, el, em, i, min, prior, _i, _len;
                min = 1000001;
                auto = null;
                for (i = _i = 0, _len = elements.length; _i < _len; i = ++_i) {
                  em = elements[i];
                  if (!scope.visible[i]) {
                    continue;
                  }
                  el = $(em);
                  if (el.hasClass('auto-width')) {
                    auto = null;
                    break;
                  }
                  prior = el.data('autoIndex');
                  if (isNaN(prior)) {
                    prior = 1000000 - el.width();
                  }
                  if (prior < min) {
                    min = prior;
                    auto = i;
                  }
                }
                if (auto !== null) {
                  $(elements[auto]).addClass('a-width');
                }
                return scope.auto = auto;
              };
              _results = [];
              for (i = _i = 0, _len = elements.length; _i < _len; i = ++_i) {
                el = elements[i];
                _results.push((function(i, el) {
                  scope.$watch('visible[' + i + ']', function(newValue, oldValue) {
                    var es;
                    es = element.find('th').not('.controls');
                    scope.clearAutoCell(es);
                    scope.updateAutoCell(es);
                    if (newValue) {
                      return $(el).removeClass('hidden-true');
                    } else {
                      return $(el).addClass('hidden-true');
                    }
                  });
                  return scope.$watch(function() {
                    var j, _j, _ref, _ref1;
                    if (scope.hover) {
                      return 1;
                    }
                    elements = element.find('th').not('.controls');
                    el = elements[i];
                    if ($(el).css('display') === 'none') {
                      return 1;
                    }
                    for (j = _j = _ref = i + 1, _ref1 = elements.length; _ref <= _ref1 ? _j < _ref1 : _j > _ref1; j = _ref <= _ref1 ? ++_j : --_j) {
                      if ($(elements[j]).css('display') !== 'none') {
                        return 1;
                      }
                    }
                    return 2;
                  }, function(newValue) {
                    return el.setAttribute('colspan', newValue);
                  });
                })(i, el));
              }
              return _results;
            }
          },
          controller: [
            '$scope', '$element', function($scope, $element) {
              this.scope = $scope;
              $scope.tableId = 'tid' + Math.round(Math.random() * 10000);
              $scope.hover = false;
            }
          ]
        };
      }
    ]);
    mod.directive('editableHeadTransclude', function() {
      return {
        require: '^editableTable',
        link: {
          post: function(scope, element, attrs, controller) {
            return element.find('thead').hover(function() {
              return scope.$apply(function() {
                var el;
                scope.hover = true;
                scope.headId = 'id' + Math.round(Math.random() * 10000);
                el = element.find('th:visible:last');
                el.addClass('squeezedElement');
                return $(templates.editableTh({
                  id: scope.headId,
                  tableId: controller.scope.tableId,
                  width: el.width()
                })).appendTo(element.find('thead tr')).find('i.close.icon-cog').click(function(e) {
                  return setTimeout(function() {
                    return element.find('thead').contextmenu('show', e);
                  }, 1);
                });
              });
            }, function() {
              return scope.$apply(function() {
                controller.scope.hover = false;
                element.find('.controls').hide();
                element.find('.squeezedElement').removeClass('squeezedElement');
                return element.find('#' + scope.headId).remove();
              });
            });
          }
        },
        controller: [
          '$transclude', '$element', function($transclude, $element) {
            return $transclude(function(clone) {
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
        require: '^editableTable',
        compile: function(element, attrs, transcludeFn) {
          transcludeFn(element, function(clone) {
            var $content, el, elements, i, _i, _len, _results;
            $content = $(clone).filter('script').text().replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
            element.append($content);
            elements = element.children('td').not('.controls');
            _results = [];
            for (i = _i = 0, _len = elements.length; _i < _len; i = ++_i) {
              el = elements[i];
              el.setAttribute('colspan', '{{noColumns(hover, ' + i + ')}}');
              _results.push($(el).addClass('hidden-{{!visible(' + i + ')}}'));
            }
            return _results;
          });
          return function(scope, element, attrs, controller) {
            scope.noColumns = function(hover, i) {
              var el, elements, j, _i, _ref, _ref1;
              if (hover) {
                return 1;
              }
              elements = element.children('td').not('.controls');
              el = elements[i];
              if ($(el).css('display') === 'none') {
                return 1;
              }
              for (j = _i = _ref = i + 1, _ref1 = elements.length; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; j = _ref <= _ref1 ? ++_i : --_i) {
                if ($(elements[j]).css('display') !== 'none') {
                  return 1;
                }
              }
              return 2;
            };
            scope.visible = function(i) {
              try {
                return controller.scope.visible[i];
              } catch (_error) {
                return true;
              }
            };
            scope.mouseEnter = function() {
              var el;
              scope.hover = true;
              scope.id = 'id' + Math.round(Math.random() * 10000);
              el = element.find('td:visible:last');
              el.addClass('squeezedElement');
              return $(templates.editableTd({
                id: scope.id,
                width: el.width(),
                tableId: controller.scope.tableId
              })).appendTo(element).find('i.close').click(function() {
                return scope.$apply(function() {
                  return scope.removeItem(scope.$index);
                });
              });
            };
            return scope.mouseLeave = function() {
              scope.hover = false;
              element.find('.squeezedElement').removeClass('squeezedElement');
              return element.find('#' + scope.id).remove();
            };
          };
        }
      };
    });
  });

}).call(this);
