const $ = require('jquery')
const Util = require('../../core/util')
const B64 = require('B64')
const _ = require('lodash')
const angular = require('angular')

require('jquery.event.drag')
require('jquery.bootstrap.contextmenu')
require('html2canvas')

const templateSortArrow = require('./templates/sortArrow.jade')
const templateEditableTable = require('./templates/editableTable.jade')
const templateEditableTbody = require('./templates/editableTbody.jade')
const templateEditableTcontext = require('./templates/editableTcontext.jade')
const templateEditableWidgets = require('./templates/editableWidgets.jade')

var ngModule = angular.module('editable-table', [])

ngModule.directive('sortArrow', function () {
  return {
    template: templateSortArrow(),
    restrict: 'E',

    scope: {
      model: '=',
      sortBy: '&',
      compareFunction: '&',
      hideArrows: '@'
    },

    replace: true,
    transclude: true,

    link: function (scope, element, attrs) {
      scope.ascending = false

      scope.sort = function () {
        if (attrs.sortBy != null) {
          scope.model = _.sortBy(scope.model, function (o) {
            return scope.sortBy({
              o: o
            })
          })
        } else if (attrs.compareFunction != null) {
          scope.model.sort(function (a, b) {
            return scope.compareFunction({
              a: a,
              b: b
            })
          })
        }

        if (!scope.ascending) {
          return scope.model.reverse()
        }
      }

      scope.elementToString = function (el) {
        if (el.hasClass('sortarrow')) {
          return elementToString(element.find('.sortarrow-content'))
        }

        return false
      }

      return scope.toggleSort = function () {
        scope.ascending = !scope.ascending
        return scope.sort()
      }
    }
  }
})

var eligibleForExport = function (element, visible) {
  return !(element.hasClass('dont-export') || element.hasClass('dont-export-true') || (visible && element.css('display') === 'none'))
}

var elementToString = function (element, visible = false) {
  var r

  if (!eligibleForExport(element, visible)) {
    return ''
  }

  var scope = angular.element(element).scope()

  if (scope.elementToString) {
    r = scope.elementToString(element, visible)

    if (r || typeof (r) === 'string') {
      return r
    }
  }

  var first = false
  r = ''

  element.children().each(function () {
    var nw = elementToString($(this), visible)
    r += nw
    return first = true
  })

  if (!first) {
    return element.text()
  }

  return r
}

var serializeTr = function (element, visible = false) {
  var arr = []

  element.children().each(function () {
    var $this = $(this)

    if (!eligibleForExport($this, visible)) {
      return
    }

    if (this.tagName !== 'TD' && this.tagName !== 'TH') {
      return
    }

    return arr.push(elementToString($this, visible))
  })

  return arr
}

var adjustWidget = function (bar, row, id) {
  var d

  if (bar.data('lastId') !== id) {
    return
  }

  if (bar.hasClass('hidden-true')) {
    return
  }

  var offset = row.offset()
  console.log(offset)
  var w = row.outerWidth()
  var h = row.outerHeight()
  bar.css('right', $('body').outerWidth() - offset.left - w)
  bar.css('top', offset.top)
  bar.css('height', h)

  bar.data('margins', d = {
    off: offset,
    w: w,
    h: h
  })

  return d
}

var setWidgets = function (bar, id, row) {
  bar.data('lastId', id)
  bar.removeClass('hidden-true')
  return adjustWidget(bar, row, id)
}

var resetWidgets = function (bar, id, event) {
  var d
  var elem

  if (bar.data('lastId') !== id) {
    return
  }

  if ((elem = $(event.delegateTarget)).is(bar)) {
    d = bar.data('margins')
  } else {
    d = adjustWidget(bar, elem, id)
  }

  var x = event.pageX
  var y = event.pageY

  if (d && (x >= d.off.left) && (x < d.off.left + d.w) && (y >= d.off.top) && (y < d.off.top + d.h)) {
    return
  }

  return bar.addClass('hidden-true')
}

var setUpWidget = function (
  bar,
  row,
  test = (function () {
    return true
  }),
  id = (function () {
    return 'id'
  })) {
  row.hover((function (e) {
    if (!test()) {
      return
    }

    return setWidgets(bar, id(), row)
  }), (function (e) {
    return resetWidgets(bar, id(), e)
  }))

  var adj = function () {
    return adjustWidget(bar, row, id())
  }

  row.click(adj)
  return row.on('focusin focusout', setTimeout.bind(null, adj, 0))
}

ngModule.directive('editableTable', ['$parse', function ($parse) {
  return {
    template: templateEditableTable(),
    restrict: 'AE',
    replace: true,
    transclude: true,

    scope: {
      model: '=',
      addItem_: '&addItem',
      removeItem_: '&removeItem',
      canRemoveItem_: '&canRemoveItem',
      visible_: '@visible',
      reorders: '@reorders',
      tableClass_: '@tableClass',
      rowClicked_: '&rowClicked'
    },

    link: {
      post: function (scope, element, attrs) {
        var updateAutoCell
        var rowWidget
        var headWidget
        var elements = element.find('th').not('.controls')
        var n = elements.length

        var context = $(templateEditableTcontext({
          id: scope.tableId,
          n: n
        })).appendTo($('body'))

        var widgets = $(templateEditableWidgets({
          id: scope.tableId
        })).appendTo($('body'))

        scope.$watch(
          () => attrs.showGear,
          value => {
            scope.showGear = (typeof value !== 'undefined' && value !== null)
              ? $parse(value)(scope.$parent)
              : true
          }
        )

        scope.$watch(function () {
          return attrs.tableClass
        }, function (value) {
          return scope.tableClass = (typeof value !== 'undefined' && value !== null ? value : 'table table-striped table-bordered')
        })

        scope.$on('$destroy', function () {
          context.remove()
          return widgets.remove()
        })

        scope.canRemoveItem = function (o, index) {
          if (!(attrs.canRemoveItem != null)) {
            return attrs.removeItem != null
          }

          return scope.canRemoveItem_({
            o: o,
            index: index
          })
        }

        scope.removeItem = function (index) {
          var fcn = scope.removeItem_

          if (fcn) {
            return fcn({
              index: index
            })
          } else {
            return scope.model.splice(index, 1)
          }
        };

        (headWidget = widgets.find('.widget-head')).click(function (e) {
          return setTimeout(function () {
            return element.find('thead').contextmenu('show', e)
          }, 1)
        });

        (rowWidget = widgets.find('.widget-row')).click(function (e) {
          var idx = rowWidget.data('lastId')

          if (!isNaN(idx)) {
            rowWidget.data('margins', null)
            resetWidgets(rowWidget, idx, e)

            return Util.safeApply(scope, function () {
              return scope.removeItem(idx)
            })
          }
        })

        var widgetMouseOut = function (e) {
          var el = $(e.currentTarget)
          return resetWidgets(el, el.data('lastId'), e)
        }

        headWidget.mouseout(widgetMouseOut)
        rowWidget.mouseout(widgetMouseOut)

        setUpWidget(headWidget, element.find('thead'), function () {
          return scope.showGear
        }, function () {
          return 'head'
        })

        var exportCSV = function (separator = ',', fileName = 'table.csv') {
          var csv = []

          element.find('tr').each(function () {
            var $this = $(this)

            if (!eligibleForExport($this, true)) {
              return
            }

            return csv.push(serializeTr($this, true))
          })

          var txt = []

          for (var [i, row] of csv.entries()) {
            if (i) {
              txt.push('\r\n')
            }

            for (var [j, cell] of row.entries()) {
              if (j) {
                txt.push(separator)
              }

              if (/[\t\n,;"]/.test(cell)) {
                txt.push('"' + cell.replace(/"/g, '""') + '"')
              } else {
                txt.push(cell)
              }
            }
          }

          var data = B64.encode(txt.join(''))

          var link = $(
            '<a id="downloader" download="' + fileName + '" href="data:application/octet-stream;base64,' + data + '"></a>'
          ).appendTo($('body'))

          link[0].click()
          return link.remove()
        }

        element.find('thead').contextmenu({
          target: '.context-menu-' + scope.tableId,

          before: function (e, element, target) {
            var nm = serializeTr(element.find('tr'))

            context.find('li.hide-row').each(function (index, element) {
              var el = $(element)
              var i = parseInt(el.data('index'))
              el.find('.item-label').html(nm[i])
              var icon = el.find('i')

              if (scope.visible[i]) {
                icon.removeClass('fa-square-o')
                return icon.addClass('fa-check-square-o')
              } else {
                icon.removeClass('fa-check-square-o')
                return icon.addClass('fa-square-o')
              }
            })

            return true
          },

          onItem: function (e, item) {
            var i = parseInt(item.data('index'))

            if (isNaN(i)) {
              i = parseInt(item.parents('li').data('index'))
            }

            if (!isNaN(i)) {
              return Util.safeApply(scope, function () {
                scope.visible[i] = !scope.visible[i]

                if (!_.reduce(scope.visible, (function (m, i) {
                  return m || i
                }), false)) {
                  return scope.visible[i] = !scope.visible[i]
                } else {
                  return updateVisibles()
                }
              })
            } else if (item.hasClass('export-csv-comma') || item.parents('.export-csv-comma').length) {
              return exportCSV(',', 'table-colons.csv')
            } else if (item.hasClass('export-csv-semicolon') || item.parents('.export-csv-semicolon').length) {
              return exportCSV(';', 'table-semicolons.csv')
            }
          }
        })

        if (!(scope.visible != null)) {
          scope.visible = []
        }

        while (scope.visible.length < n) {
          scope.visible.push(true)
        }

        scope.$watch('visible_', function (newValue) {
          var newArray
          var p = $parse(newValue)
          var ps = scope.$parent
          var val = p(ps)

          if (!(val && val instanceof Array) && p.assign) {
            newArray = []
            p.assign(ps, newArray)
            val = newArray
          }

          if (val) {
            while (val.length < n) {
              val.push(true)
            }

            scope.visible = val
            return updateVisibles()
          }
        })

        var updateVisibles = function () {
          var s = ''

          for (var i of (function () {
            var results = []

            for (var i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i++ : i--)) {
              results.push(i)
            }

            return results
          }).apply(this)) {
            if (!scope.visible[i]) {
              s += 'table.editable-table.' + scope.tableId + ' td:nth-child(' + (i + 1) + ') { display:none; }\n'
              s += 'table.editable-table.' + scope.tableId + ' th:nth-child(' + (i + 1) + ') { display:none; }\n'
            }
          }

          element.find('> tbody > style.visible-style').html(s)
          var es = element.find('> thead > tr > th')
          clearAutoCell(es)
          return updateAutoCell(es)
        }

        var clearAutoCell = function (elements) {
          if (scope.auto !== null) {
            $(elements[scope.auto]).removeClass('a-width')
            return scope.auto = null
          }
        }

        return updateAutoCell = function (elements) {
          var min = 1000001
          var auto = null

          for (var [i, em] of elements.toArray().entries()) {
            if (!scope.visible[i]) {
              continue
            }

            var el = $(em)

            if (el.hasClass('auto-width')) {
              auto = null
              break
            }

            var prior = el.data('autoIndex')

            if (isNaN(prior)) {
              prior = 1000000 - el.width()
            }

            if (prior < min) {
              min = prior
              auto = i
            }
          }

          if (auto !== null) {
            $(elements[auto]).addClass('a-width')
          }

          return scope.auto = auto
        }
      }
    },

    controller: ['$scope', '$element', function ($scope, $element) {
      this.scope = $scope
      $scope.tableId = 'tid' + Math.round(Math.random() * 10000)
      return
    }]
  }
}])

ngModule.directive('editableHeadTransclude', function () {
  return {
    require: '^editableTable',

    controller: [
      '$transclude',
      '$element',
      '$scope',
      function ($transclude, $element, $scope) {
        return $transclude(function (clone) {
          return $element.append(clone)
        })
      }
    ]
  }
})

ngModule.directive('editableTbody', function () {
  return {
    template: templateEditableTbody(),
    transclude: true,
    restrict: 'AE',
    require: '^editableTable',

    link: function (scope, element, attr, controller) {
      scope.getScope = function () {
        return controller.scope
      }

      scope.$watch(function () {
        return attr.addItemLabel
      }, function () {
        return scope.addLabel = attr.addItemLabel
      })

      scope.addItem = function () {
        controller.scope.addItem_()

        return setTimeout(function () {
          var item

          if (item = Util.focusableElement(element.find('tr:nth-last-child(3)'))) {
            return item.focus()
          }
        }, 1)
      }

      return scope.rowClicked = function ($index) {
        return controller.scope.rowClicked_({
          $index: $index
        })
      }
    }
  }
})

ngModule.directive('editableScriptTransclude', function () {
  return {
    require: '^editableTable',

    compile: function (element, attrs, transcludeFn) {
      transcludeFn(element, function (clone) {
        var $content = $(clone).filter('script').text().replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
        return element.append($content)
      })

      return {
        post: function (scope, element, attrs, controller) {
          var dragPointY
          var elements = element.children('td').not('.controls')

          var widget = $(
            'body > .table-widgets.widgets-' + controller.scope.tableId + ' > .widget-row'
          )

          setUpWidget(widget, element, function () {
            return controller.scope.canRemoveItem(scope.o, scope.$index)
          }, function () {
            return scope.$index
          })

          var currentPoint = null

          var getCurrentPoint = function (x, y) {
            var parent = element.parent()
            var rows = parent.children()
            var n = rows.length - 1

            if (!n) {
              return null
            }

            var lel = $(rows[n - 1])
            var lelbt = lel.offset().top + lel.outerHeight()

            if (y > lelbt + 10) {
              return null
            }

            var po = parent.offset()

            if (y < po.top - 10) {
              return null
            }

            if (x < po.left || x > po.left + parent.outerWidth()) {
              return null
            }

            var a = 0
            var b = n

            while (a < b) {
              var m = (a + b) >> 1
              var el = $(rows[m])

              if (y < el.offset().top + el.outerHeight() / 2) {
                b = m
              } else {
                a = m + 1
              }
            }

            return {
              index: b,

              y: (() => {
                if (b === n) {
                  return lelbt
                } else {
                  return $(rows[b]).offset().top
                }
              })()
            }
          }

          var $canvas = null
          var $line = null
          var dragPointX = dragPointY = 0
          var dragStart = null

          var updateCanvas = function (e) {
            var pnt

            if ($canvas) {
              $canvas.css('left', e.pageX - dragPointX)
              $canvas.css('top', e.pageY - dragPointY)
            }

            if ($line) {
              pnt = getCurrentPoint(e.pageX, e.pageY)

              if (pnt && (pnt.index === dragStart || pnt.index === dragStart + 1)) {
                pnt = null
              }

              if (currentPoint && !pnt) {
                $line.css('display', 'none')
              } else if (pnt && !currentPoint) {
                $line.css('display', 'block')
              }

              if (pnt) {
                $line.css('top', pnt.y + 'px')
              }

              return currentPoint = pnt
            }
          }

          var sc = controller.scope

          element.on('draginit', function (e) {
            if (!sc.reorders) {
              return false
            }

            return element
          })

          element.on('dragstart', function (e) {
            if (!sc.reorders) {
              return false
            }

            var table = element.parents('table')
            dragStart = element.index()
            var scrollX = window.pageXOffset
            var scrollY = window.pageYOffset

            html2canvas(element[0], {
              scale: (window.devicePixelRatio ? window.devicePixelRatio : 1),

              onrendered: function (fullCanvas) {
                window.scrollTo(scrollX, scrollY)
                var fullContex = fullCanvas.getContext('2d')

                var parseIntN = function (s) {
                  var n = parseInt(s)

                  if (isNaN(n)) {
                    return 0
                  }

                  return n
                }

                var td = element.find('td:visible')

                var borders = {
                  left: parseIntN(td.css('border-left-width')) + parseIntN(element.css('border-left-width')),
                  right: parseIntN(td.last().css('border-right-width')) + parseIntN(element.css('border-right-width')),
                  top: parseIntN(td.css('border-top-width')) + parseIntN(element.css('border-top-width')),
                  bottom: parseIntN(td.css('border-bottom-width')) + parseIntN(element.css('border-bottom-width'))
                }

                var pos = element.offset()
                var elW = element.outerWidth()
                var elH = element.outerHeight()

                var scale = {
                  x: fullCanvas.width / elW,
                  y: fullCanvas.height / elH
                }

                var css = {
                  width: elW - borders.left - borders.right,
                  height: elH - borders.top - borders.bottom
                }

                pos.left = borders.left * scale.x
                pos.top = borders.top * scale.y
                pos.width = css.width * scale.x
                pos.height = css.height * scale.y
                var canvas = document.createElement('canvas')
                $canvas = $(canvas)
                $canvas.attr('width', pos.width)
                $canvas.attr('height', pos.height)
                $canvas.css('width', css.width)
                $canvas.css('height', css.height)
                canvas.getContext('2d').drawImage(fullCanvas, -pos.left, -pos.top)
                $canvas.css('border', '1px solid #dddddd')
                $canvas.css('position', 'absolute')
                $canvas.css('opacity', '0.6')
                var offs = element.offset()
                dragPointX = e.pageX - offs.left
                dragPointY = e.pageY - offs.top
                element.css('opacity', '0.4')
                $line = $(document.createElement('div'))
                $line.css('position', 'absolute')
                $line.css('border', '1px solid #0088cc')
                $line.css('border-radius', '1px')
                $line.css('width', element.outerWidth())
                $line.css('left', element.offset().left)
                $line.css('display', 'none')
                updateCanvas(e)
                $(document.body).append($line)
                $(document.body).append($canvas)
                return
              }
            })

            return $line
          })

          element.on('drag', {
            distance: 4
          }, function (e) {
            updateCanvas(e)
            return
          })

          return element.on('dragend', function (e) {
            var idx

            if ($canvas) {
              $canvas.remove()
              $canvas = null
            }

            element.css('opacity', '1')

            if ($line) {
              $line.remove()
              $line = null
            }

            if (sc.reorders && currentPoint) {
              idx = currentPoint.index

              if (idx > dragStart) {
                idx--
              }

              if (idx !== dragStart) {
                Util.safeApply(sc, function () {
                  var arr = sc.model
                  var el = arr.splice(dragStart, 1)[0]
                  return arr.splice(idx, 0, el)
                })
              }
            }

            return
          })
        }
      }
    }
  }
})
