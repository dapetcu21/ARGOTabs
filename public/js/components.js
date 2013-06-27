(function() {
  define(['jquery', 'util', 'B64', 'underscore', 'templates', 'angular', 'jquery.event.drag', 'jquery.bootstrap.contextmenu', 'html2canvas'], function($, Util, B64) {
    var elementToString, mod, serializeTr;
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
        restrict: 'E',
        scope: {
          value: '=bind',
          extra: '@',
          minWidth: '@inputWidth'
        },
        replace: true,
        link: function(scope, element) {
          var callback, input, label;
          scope.editing = false;
          label = element.find('.textedit-label');
          input = element.find('input');
          callback = function() {
            return Util.safeApply(scope, function() {
              return scope.beginEdit();
            });
          };
          label.focus(callback);
          if (element.parent()[0].tagName === 'TD') {
            element.parent().click(callback);
          }
          input.blur(function() {
            return Util.safeApply(scope, function() {
              return scope.endEdit();
            });
          });
          input.keypress(function(e) {
            if (e.which === 13) {
              return Util.safeApply(scope, function() {
                return scope.endEdit();
              });
            }
          });
          scope.beginEdit = function() {
            var minW, rw;
            if (scope.editing) {
              return;
            }
            scope.editing = true;
            input[0].value = scope.value;
            minW = parseInt(scope.minWidth);
            if (isNaN(minW)) {
              minW = 100;
            }
            rw = label.outerWidth();
            if (minW > rw) {
              rw = minW;
            }
            input.css('width', rw);
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
        restrict: 'E',
        scope: {
          value: '=bind',
          choiceName: '&choiceName',
          choices: '=choices',
          allowNil: '@nilPlaceholder',
          minWidth: '@inputWidth'
        },
        replace: true,
        compile: function(element, attrs, transclude) {
          if (!attrs.nilPlaceholder) {
            element.find('option').remove();
          }
          return function(scope, element, attrs) {
            var callback, label, select;
            scope.editing = false;
            select = element.find('select');
            label = element.find('.multi-label');
            callback = function() {
              return Util.safeApply(scope, function() {
                return scope.beginEdit();
              });
            };
            label.focus(callback);
            if (element.parent()[0].tagName === 'TD') {
              element.parent().click(callback);
            }
            select.blur(function() {
              return Util.safeApply(scope, function() {
                return scope.endEdit();
              });
            });
            scope.beginEdit = function() {
              var minW, rw;
              if (scope.editing) {
                return;
              }
              scope.editing = true;
              minW = parseInt(scope.minWidth);
              if (isNaN(minW)) {
                minW = 100;
              }
              rw = label.outerWidth();
              if (minW > rw) {
                rw = minW;
              }
              select.css('width', rw);
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
          };
        }
      };
    });
    mod.directive("hlistCell", [
      '$parse', function($parse) {
        return {
          template: templates.hlistCell(),
          restrict: 'E',
          scope: {
            model: '=bind',
            addItem: '&addItem',
            removeItem: '&removeItem',
            editHidden: '=editHidden',
            separator: '@separator'
          },
          transclude: true,
          link: function(scope, element, attrs) {
            scope.edit = false;
            scope.remove = function(index) {
              scope.removeItem({
                index: index
              });
              if (!scope.model.length) {
                return scope.edit = false;
              }
            };
            scope.add = function() {
              scope.addItem();
              return setTimeout(function() {
                var item;
                if (item = Util.focusableElement(element.find('.list-items')[0], false)) {
                  return item.focus();
                }
              }, 1);
            };
            return scope.comma = function(show) {
              if (show) {
                return ',';
              } else {
                return '';
              }
            };
          }
        };
      }
    ]);
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
          scope.elementToString = function(el) {
            if (el.hasClass('sortarrow')) {
              return elementToString(element.find('.sortarrow-content'));
            }
            return false;
          };
          return scope.toggleSort = function() {
            scope.ascending = !scope.ascending;
            return scope.sort();
          };
        }
      };
    });
    elementToString = function(element, visible) {
      var first, r, scope;
      if (visible == null) {
        visible = false;
      }
      if (element.hasClass('dont-export') || (visible && element.css('display') === 'none')) {
        return '';
      }
      scope = angular.element(element).scope();
      if (scope.elementToString) {
        r = scope.elementToString(element, visible);
        if (r || typeof r === 'string') {
          return r;
        }
      }
      first = false;
      r = '';
      element.children().each(function() {
        var nw;
        nw = elementToString($(this), visible);
        if (nw) {
          if (first) {
            r += ' ';
          }
          r += nw;
          return first = true;
        }
      });
      if (!first) {
        return element.text();
      }
      return r;
    };
    serializeTr = function(element, visible) {
      var arr;
      if (visible == null) {
        visible = false;
      }
      arr = [];
      element.children().each(function() {
        var $this;
        $this = $(this);
        if ($this.hasClass('dont-export')) {
          return;
        }
        if (this.tagName !== 'TD' && this.tagName !== 'TH') {
          return;
        }
        if (visible && $this.css('display') === 'none') {
          return;
        }
        return arr.push(elementToString($this, visible));
      });
      return arr;
    };
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
            visible_: '@visible',
            reorders: '@reorders'
          },
          link: {
            post: function(scope, element, attrs) {
              var context, el, elements, exportCSV, i, n, _i, _len, _results;
              elements = element.find('th').not('.controls');
              n = elements.length;
              context = $(templates.editableTcontext({
                id: scope.tableId,
                n: n
              })).appendTo($('body'));
              scope.$on('$destroy', function() {
                return context.remove();
              });
              exportCSV = function() {
                var cell, csv, data, i, j, link, row, txt, _i, _j, _len, _len1;
                csv = [];
                element.find('tr').each(function() {
                  var $this;
                  $this = $(this);
                  if ($this.hasClass('dont-export')) {
                    return;
                  }
                  return csv.push(serializeTr($this, true));
                });
                txt = '';
                for (i = _i = 0, _len = csv.length; _i < _len; i = ++_i) {
                  row = csv[i];
                  if (i) {
                    txt += '\r\n';
                  }
                  for (j = _j = 0, _len1 = row.length; _j < _len1; j = ++_j) {
                    cell = row[j];
                    if (j) {
                      txt += ',';
                    }
                    txt += '"' + cell.replace(/"/g, '""') + '"';
                  }
                }
                data = B64.encode(txt);
                link = $('<a id="downloader" download="table.csv" href="data:application/octet-stream;base64,' + data + '"></a>').appendTo($("body"));
                link[0].click();
                return link.remove();
              };
              element.find('thead').contextmenu({
                target: '.context-menu-' + scope.tableId,
                before: function(e, element, target) {
                  var nm;
                  nm = serializeTr(element.find('tr'));
                  context.find('li.hide-row').each(function(index, element) {
                    var el, i, icon;
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
                  if (!isNaN(i)) {
                    return Util.safeApply(scope, function() {
                      scope.visible[i] = !scope.visible[i];
                      if (!_.reduce(scope.visible, (function(m, i) {
                        return m || i;
                      }), false)) {
                        return scope.visible[i] = !scope.visible[i];
                      }
                    });
                  } else {
                    if (item.hasClass('export-csv') || item.parents('.export-csv')) {
                      return exportCSV();
                    }
                  }
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
                if (!(val && val instanceof Array) && p.assign) {
                  newArray = [];
                  p.assign(ps, newArray);
                  val = newArray;
                }
                if (val) {
                  while (val.length < n) {
                    val.push(true);
                  }
                  return scope.visible = val;
                }
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
              return Util.safeApply(scope, function() {
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
              return Util.safeApply(scope, function() {
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
              var item;
              if (item = Util.focusableElement(element.find("tr:nth-last-child(2)")[0])) {
                return item.focus();
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
          return {
            post: function(scope, element, attrs, controller) {
              var $canvas, $line, currentPoint, dragPointX, dragPointY, dragStart, elements, getCurrentPoint, sc, updateCanvas;
              elements = element.children('td').not('.controls');
              scope.noColumns = function(hover, i) {
                var el, j, _i, _ref, _ref1;
                if (hover) {
                  return 1;
                }
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
                if (scope.hover) {
                  return;
                }
                scope.hover = true;
                scope.id = 'id' + Math.round(Math.random() * 10000);
                el = element.find('td:visible:last');
                el.addClass('squeezedElement');
                return $(templates.editableTd({
                  id: scope.id,
                  width: el.width(),
                  tableId: controller.scope.tableId
                })).appendTo(element).find('i.close').click(function() {
                  return Util.safeApply(scope, function() {
                    return scope.removeItem(scope.$index);
                  });
                });
              };
              scope.mouseLeave = function() {
                if (!scope.hover) {
                  return;
                }
                scope.hover = false;
                element.find('.squeezedElement').removeClass('squeezedElement');
                return element.find('#' + scope.id).remove();
              };
              currentPoint = null;
              getCurrentPoint = function(x, y) {
                var a, b, el, lel, lelbt, m, n, omitLast, parent, po, rows;
                parent = element.parent();
                rows = parent.children();
                omitLast = scope.addLabel;
                n = rows.length;
                if (omitLast) {
                  n--;
                }
                if (!n) {
                  return null;
                }
                lel = $(rows[n - 1]);
                lelbt = lel.offset().top + lel.outerHeight();
                if (y > lelbt + 10) {
                  return null;
                }
                po = parent.offset();
                if (y < po.top - 10) {
                  return null;
                }
                if (x < po.left || x > po.left + parent.outerWidth()) {
                  return null;
                }
                a = 0;
                b = n;
                while (a < b) {
                  m = (a + b) >> 1;
                  el = $(rows[m]);
                  if (y < el.offset().top + el.outerHeight() / 2) {
                    b = m;
                  } else {
                    a = m + 1;
                  }
                }
                return {
                  index: b,
                  y: b === n ? lelbt : $(rows[b]).offset().top
                };
              };
              $canvas = null;
              $line = null;
              dragPointX = dragPointY = 0;
              dragStart = null;
              updateCanvas = function(e) {
                var pnt;
                if ($canvas) {
                  $canvas.css('left', e.pageX - dragPointX);
                  $canvas.css('top', e.pageY - dragPointY);
                }
                if ($line) {
                  pnt = getCurrentPoint(e.pageX, e.pageY);
                  if (pnt && (pnt.index === dragStart || pnt.index === dragStart + 1)) {
                    pnt = null;
                  }
                  if (currentPoint && !pnt) {
                    $line.css('display', 'none');
                  } else if (pnt && !currentPoint) {
                    $line.css('display', 'block');
                  }
                  if (pnt) {
                    $line.css('top', pnt.y + 'px');
                  }
                  return currentPoint = pnt;
                }
              };
              sc = controller.scope;
              element.on('draginit', function(e) {
                if (!sc.reorders) {
                  return false;
                }
                return element;
              });
              element.on('dragstart', function(e) {
                var table;
                if (!sc.reorders) {
                  return false;
                }
                table = element.parents('table');
                dragStart = element.index();
                html2canvas(element[0], {
                  scale: window.devicePixelRatio ? window.devicePixelRatio : 1,
                  onrendered: function(fullCanvas) {
                    var borders, canvas, css, elH, elW, fullContex, offs, parseIntN, pos, scale, td;
                    fullContex = fullCanvas.getContext('2d');
                    parseIntN = function(s) {
                      var n;
                      n = parseInt(s);
                      if (isNaN(n)) {
                        return 0;
                      }
                      return n;
                    };
                    td = element.find('td:visible');
                    borders = {
                      left: parseIntN(td.css('border-left-width')) + parseIntN(element.css('border-left-width')),
                      right: parseIntN(td.last().css('border-right-width')) + parseIntN(element.css('border-right-width')),
                      top: parseIntN(td.css('border-top-width')) + parseIntN(element.css('border-top-width')),
                      bottom: parseIntN(td.css('border-bottom-width')) + parseIntN(element.css('border-bottom-width'))
                    };
                    pos = element.offset();
                    elW = element.outerWidth();
                    elH = element.outerHeight();
                    scale = {
                      x: fullCanvas.width / elW,
                      y: fullCanvas.height / elH
                    };
                    css = {
                      width: elW - borders.left - borders.right,
                      height: elH - borders.top - borders.bottom
                    };
                    pos.left = borders.left * scale.x;
                    pos.top = borders.top * scale.y;
                    pos.width = css.width * scale.x;
                    pos.height = css.height * scale.y;
                    canvas = document.createElement('canvas');
                    $canvas = $(canvas);
                    $canvas.attr('width', pos.width);
                    $canvas.attr('height', pos.height);
                    $canvas.css('width', css.width);
                    $canvas.css('height', css.height);
                    canvas.getContext('2d').drawImage(fullCanvas, -pos.left, -pos.top);
                    $canvas.css('border', '1px solid #dddddd');
                    $canvas.css('position', 'fixed');
                    $canvas.css('opacity', '0.6');
                    offs = element.offset();
                    dragPointX = e.pageX - offs.left;
                    dragPointY = e.pageY - offs.top;
                    element.css('opacity', '0.4');
                    $line = $(document.createElement('div'));
                    $line.css('position', 'fixed');
                    $line.css('border', '1px solid #0088cc');
                    $line.css('border-radius', '1px');
                    $line.css('width', element.outerWidth());
                    $line.css('left', element.offset().left);
                    $line.css('display', 'none');
                    $(document.body).append($line);
                    $(document.body).append($canvas);
                    updateCanvas(e);
                  }
                });
                return $line;
              });
              element.on('drag', {
                distance: 4
              }, function(e) {
                updateCanvas(e);
              });
              return element.on('dragend', function(e) {
                var idx;
                if ($canvas) {
                  $canvas.remove();
                  $canvas = null;
                }
                element.css('opacity', '1');
                if ($line) {
                  $line.remove();
                  $line = null;
                }
                if (sc.reorders && currentPoint) {
                  idx = currentPoint.index;
                  if (idx > dragStart) {
                    idx--;
                  }
                  if (idx !== dragStart) {
                    Util.safeApply(sc, function() {
                      var arr, el;
                      arr = sc.model;
                      el = arr.splice(dragStart, 1)[0];
                      return arr.splice(idx, 0, el);
                    });
                  }
                }
              });
            }
          };
        }
      };
    });
  });

}).call(this);
