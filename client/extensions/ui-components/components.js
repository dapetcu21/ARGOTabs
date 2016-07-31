const $ = require('jquery');
const Util = require('../../core/util');
const JudgeRules = require('../../models/judgerules');
const _ = require('lodash');
const angular = require('angular');

require('jquery.transit');
require('jquery.event.drag');
require('html2canvas');

const templateNavLi = require('./templates/navLi.jade');
const templateSorterCriteria = require('./templates/sorterCriteria.jade');
const templateJudgeRules = require('./templates/judgeRules.jade');
const templateTextEditCell = require('./templates/textEditCell.jade');
const templateHlistCell = require('./templates/hlistCell.jade');
const templateVlistCell = require('./templates/vlistCell.jade');
const templateMultiCell = require('./templates/multiCell.jade');

var ngModule = angular.module("components", []);

ngModule.directive("navLi", function() {
  return {
    restrict: "E",

    scope: {
      href: "@"
    },

    transclude: true,
    replace: true,

    controller: ["$scope", "$location", function($scope, $location) {
      return $scope.$watch(function() {
        return $location.path();
      }, function(newValue, oldValue) {
        return $scope.class = ((newValue === $scope.href) ? "active" : "");
      });
    }],

    template: templateNavLi()
  };
});

ngModule.directive("sorterCriteria", [function() {
  return {
    template: templateSorterCriteria(),
    restrict: "E",

    scope: {
      model: "=bind",
      onUpdate: "&onUpdate"
    },

    link: function(scope, element, attrs) {
      return scope.manualMove = function(from, to) {
        if (to !== from) {
          Util.safeApply(scope, function() {
            var el = scope.model.criteria.splice(from, 1)[0];
            return scope.model.criteria.splice(to, 0, el);
          });
        }

        if (attrs.onUpdate != null) {
          return scope.onUpdate();
        }
      };
    }
  };
}]);

ngModule.directive("judgeRules", function() {
  return {
    template: templateJudgeRules(),
    restrict: "E",
    replace: true,

    scope: {
      model: "="
    },

    controller: ["$scope", "$element", function(scope, element) {
      scope.verbs = [0, 1];
      scope.verbNames = JudgeRules.verbLabel;

      scope.buildJudgeList = function() {
        var m = scope.model;
        var nm = scope.judgeNames = [];
        var idx = scope.judgeIndexes = [];

        for (var [i, o] of (scope.judgeList = scope.model.judgeArray()).entries()) {
          nm.push(JudgeRules.judgeLabel(o));
          idx.push(i);
        }

        return;
      };

      scope.buildTeamList = function() {
        var m = scope.model;
        var nm = scope.teamNames = [];
        var idx = scope.teamIndexes = [];

        for (var [i, o] of (scope.teamList = scope.model.teamArray()).entries()) {
          nm.push(JudgeRules.teamLabel(o));
          idx.push(i);
        }

        return;
      };

      scope.buildJudgeList();
      scope.buildTeamList();

      scope.addRule = function() {
        scope.model.addNewRule();

        return setTimeout(function() {
          var item;

          if (item = Util.focusableElement(element.find(".judge-rule:first-child"))) {
            return item.focus();
          }
        }, 1);
      };

      scope.removeRule = function(index) {
        return scope.model.removeRule(index);
      };

      this.scope = scope;
      return this;
    }]
  };
});

ngModule.directive("judgeRulesHelper", function() {
  return {
    require: "^judgeRules",

    link: function(scope, element, attr, controller) {
      var cscope = controller.scope;

      scope.$watch("vlo.judge", function(v) {
        try {
          if (cscope.judgeList[scope.judgeIndex] === v) {
            return;
          }
        } finally {}

        for (var [i, o] of cscope.judgeList.entries()) {
          if (o === v) {
            scope.judgeIndex = i;
            return;
          }
        }

        return;
      });

      scope.$watch("judgeIndex", function(v) {
        try {
          if (scope.judgeIndex != null) {
            scope.vlo.judge = cscope.judgeList[v];
          }
        } finally {}

        return;
      });

      scope.$watch("vlo.team", function(v) {
        try {
          if (cscope.teamList[scope.teamIndex] === v) {
            return;
          }
        } finally {}

        for (var [i, o] of cscope.teamList.entries()) {
          if (o === v) {
            scope.teamIndex = i;
            return;
          }
        }

        return;
      });

      return scope.$watch("teamIndex", function(v) {
        try {
          if (scope.teamIndex != null) {
            scope.vlo.team = cscope.teamList[v];
          }
        } finally {}

        return;
      });
    }
  };
});

ngModule.directive("tristateCheckbox", ["$parse", function($parse) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(function() {
        return $parse(attrs["tristateCheckbox"])(scope);
      }, function(v) {
        if (v === null) {
          element.prop("indeterminate", true);
          return element.prop("checked", true);
        } else {
          element.prop("indeterminate", false);
          return element.prop("checked", v);
        }
      });

      return element.bind("change", function() {
        var model = $parse(attrs["tristateCheckbox"]);
        var indet = element.prop("indeterminate");
        var check = element.prop("checked");

        if (!indet && !check && model(scope)) {
          element.prop("indeterminate", indet = true);
          element.prop("checked", check = true);
        }

        return scope.$apply(function() {
          if (indet) {
            return model.assign(scope, null);
          } else {
            return model.assign(scope, check);
          }
        });
      });
    }
  };
}]);

ngModule.directive("textEditCell", ["$parse", function($parse) {
  return {
    template: templateTextEditCell(),
    restrict: "E",

    scope: {
      extra: "@",
      minWidth: "@inputWidth",
      pattern: "@pattern",
      validator: "&",
      softValidator: "&",
      getter: "&",
      setter: "&",
      valid: "="
    },

    replace: true,
    transclude: true,

    link: function(scope, element, attrs) {
      var label = element.find(".textedit-label");
      var input = element.find("input");
      var inputContainer = element.find(".control-group");
      var editing = false;
      var _enabled = true;
      var lastValue = null;
      var lastValid = 2;
      var lastBoundModel = null;

      var textToModel = function(v) {
        if (attrs.setter != null) {
          return scope.setter({
            o: v
          });
        } else {
          return v;
        }
      };

      var modelToText = function(v) {
        if (attrs.getter != null) {
          return scope.getter({
            o: v
          });
        } else {
          return v;
        }
      };

      var beginEdit = function() {
        if (editing) {
          return;
        }

        editing = true;
        inputContainer.removeClass("hidden-true");
        label.addClass("hidden-true");
        var minW = parseInt(scope.minWidth);

        if (isNaN(minW)) {
          minW = 100;
        }

        var rw = label.outerWidth();

        if (minW > rw) {
          rw = minW;
        }

        input.css("width", rw);
        input.val(label.text());

        return setTimeout(function() {
          input.focus();
          return input.select();
        }, 0);
      };

      var endEdit = function() {
        var moddedValue;
        var boundModel;
        editing = false;
        inputContainer.addClass("hidden-true");
        label.removeClass("hidden-true");

        if (attrs.delayedWrite != null) {
          boundModel = textToModel(input.val());
          moddedValue = modelToText(boundModel);
          label.text(moddedValue);

          return Util.safeApply(scope, function() {
            return $parse(attrs.bind).assign(scope.$parent, boundModel);
          });
        }
      };

      var focusCallback = function() {
        if (_enabled) {
          return beginEdit();
        }
      };

      var defocusCallback = endEdit;
      element.click(focusCallback);
      label.focus(focusCallback);

      if (element.parent()[0].tagName === "TD") {
        element.parent().click(focusCallback);
      }

      input.blur(defocusCallback);

      var onChange = function(e) {
        var newValue = input.val();

        if (e.which === 13) {
          defocusCallback();
          return;
        }

        if (newValue === lastValue) {
          return;
        }

        var scopeDoings = [];

        if ((scope.pattern && typeof (newValue) === "string" && !newValue.match(new RegExp("^" + scope.pattern + "$"))) || (attrs.validator != null && !scope.validator({
          o: newValue
        }))) {
          input.val(lastValue);
          return;
        }

        var boundModel = textToModel(newValue);

        if (boundModel === lastBoundModel) {
          return;
        }

        var moddedValue = modelToText(boundModel);

        if (moddedValue !== newValue) {
          newValue = moddedValue;
          input.val(moddedValue);
        }

        if (!(attrs.delayedWrite != null)) {
          label.text(newValue);

          scopeDoings.push(function() {
            return $parse(attrs.bind).assign(scope.$parent, boundModel);
          });
        }

        var valid = (() => {
          if (!(attrs.softValidator != null)) {
            return true;
          } else {
            return scope.softValidator({
              o: boundModel
            });
          }
        })();

        if (valid !== lastValid) {
          if (attrs.valid != null) {
            scopeDoings.push(function() {
              return scope.valid = valid;
            });
          }

          if (valid) {
            element.addClass("valid");
            element.removeClass("invalid");
            input.removeClass("error");
          } else {
            element.addClass("invalid");
            element.removeClass("valid");
            input.addClass("error");
          }
        }

        lastValid = valid;
        lastValue = newValue;
        lastBoundModel = boundModel;

        if (scopeDoings.length) {
          return Util.safeApply(scope, function() {
            return (() => {
              for (var f of scopeDoings) {
                f();
              }
            })();
          });
        }
      };

      input.on("input", onChange);

      scope.$watch(function() {
        return $parse(attrs.bind)(scope.$parent);
      }, function(newValue) {
        lastBoundModel = newValue;
        lastValue = modelToText(newValue);
        label.text(lastValue);

        if (editing) {
          return input.val(lastValue);
        }
      });

      return scope.$watch((function() {
        return !(attrs.enabled != null) || scope.$parent.$eval(attrs.enabled);
      }), function(n, o) {
        _enabled = n;

        if (n) {
          return label[0].tabIndex = 0;
        } else {
          return label[0].removeAttribute("tabIndex");
        }
      });
    }
  };
}]);

ngModule.directive("multiCell", function() {
  return {
    template: templateMultiCell(),
    restrict: "E",

    scope: {
      value: "=bind",
      choiceName: "&choiceName",
      choices: "=choices",
      allowNil: "@nilPlaceholder",
      minWidth: "@inputWidth",
      onBeginEdit: "&",
      onEndEdit: "&"
    },

    replace: true,
    transclude: true,

    compile: function(element, attrs, transclude) {
      if (!attrs.nilPlaceholder || attrs.hideNil) {
        element.find("option").remove();
      }

      return function(scope, element, attrs) {
        scope.editing = false;
        var select = element.find("select");
        var label = element.find(".multi-label");

        var callback = function() {
          return Util.safeApply(scope, function() {
            return scope.beginEdit();
          });
        };

        label.focus(callback);

        if (element.parent()[0].tagName === "TD") {
          element.parent().click(callback);
        }

        select.blur(function() {
          return Util.safeApply(scope, function() {
            return scope.endEdit();
          });
        });

        scope.beginEdit = function() {
          if (scope.editing || !scope._enabled) {
            return;
          }

          scope.onBeginEdit();
          scope.editing = true;
          var minW = parseInt(scope.minWidth);

          if (isNaN(minW)) {
            minW = 100;
          }

          var rw = label.outerWidth();

          if (minW > rw) {
            rw = minW;
          }

          select.css("width", rw);

          return setTimeout(function() {
            return select.focus();
          }, 0);
        };

        scope.endEdit = function() {
          scope.editing = false;
          return scope.onEndEdit();
        };

        scope.$watch((function() {
          return !(attrs.enabled != null) || scope.$parent.$eval(attrs.enabled);
        }), function(n, o) {
          scope._enabled = n;

          if (n) {
            return label[0].tabIndex = 0;
          } else {
            return label[0].removeAttribute("tabIndex");
          }
        });

        return scope.getChoiceName = function(o) {
          if (typeof o !== "undefined" && o !== null) {
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

ngModule.directive("vlistCell", function() {
  return {
    template: templateVlistCell(),
    restrict: "E",

    scope: {
      model: "=bind",
      manualMove: "&manualMove"
    },

    transclude: true,
    replace: true,

    controller: [
      "$scope",
      "$element",
      "$attrs",
      "$transclude",
      "$parse",
      function(scope, element, attrs, $transclude, $parse) {
        this.transclude = $transclude;
        var dragElement = null;
        var currentPoint = -1;
        var lastHover = -1;
        var elementParent = null;
        var items = null;
        var offsets = null;
        var dragPointX = 0;
        var dragPointY = 0;
        var dragStart = -1;
        var w = 0;
        var h = 0;

        element.on("draginit", function(e) {
          var offs;
          var a;
          var el = $(e.target);
          dragElement = null;
          elementParent = null;

          if (el.hasClass("moveable-true")) {
            elementParent = el;
          } else if ((a = el.parents(".moveable-true")).length) {
            elementParent = a;
          }

          if (elementParent) {
            items = element.find(".item");
            dragStart = $.makeArray(items).indexOf(elementParent[0]);
            dragElement = elementParent.find(".vlist-content");
            offs = dragElement.offset();
            dragPointX = e.pageX - offs.left;
            dragPointY = e.pageY - offs.top;
            return element;
          }

          return false;
        });

        var updatePoint = function(e) {
          var currentHover = -1;

          for (var [i, _el] of items.toArray().entries()) {
            if (i === dragStart) {
              continue;
            }

            var el = $(_el);
            var offs = el.offset();

            if (offs.left <= e.pageX && e.pageX <= offs.left + el.outerWidth() && offs.top <= e.pageY && e.pageY <= offs.top + el.outerHeight()) {
              currentHover = i;
              break;
            }
          }

          if (currentHover !== lastHover && currentHover >= 0) {
            if (currentPoint >= dragStart) {
              currentPoint++;
            }

            if (currentPoint <= currentHover) {
              currentPoint = currentHover + 1;
            } else {
              currentPoint = currentHover;
            }

            if (currentPoint > dragStart) {
              currentPoint--;
            }
          }

          return lastHover = currentHover;
        };

        var relayout = function() {};

        var updateState = function(e) {
          var i;
          var top;
          dragElement.css("left", e.pageX - dragPointX);
          dragElement.css("top", e.pageY - dragPointY);
          var lastPoint = currentPoint;
          updatePoint(e);

          if (currentPoint !== lastPoint) {
            top = 0;
            i = 0;

            return (() => {
              for (var [j, el] of items.toArray().entries()) {
                if (j === dragStart) {
                  continue;
                }

                if (i === currentPoint) {
                  top += h;
                }

                i++;

                $(el).transition({
                  top: top,
                  duration: 100
                });

                top += offsets[j].h;
              }
            })();
          }
        };

        element.on("dragstart", function(e) {
          var container = element;
          container.css("width", container.width());
          container.css("height", container.height());
          offsets = [];

          for (var [i, _el] of items.toArray().entries()) {
            var el = $(_el);
            var o = el.position();
            o.w = el.width();
            o.h = el.height();
            offsets.push(o);
          }

          for (var [i, _el] of items.toArray().entries()) {
            el = $(_el);
            o = offsets[i];
            el.css("width", o.w);
            el.css("height", o.h);
            el.css("top", o.top);
            el.css("left", o.left);
            el.css("position", "absolute");
          }

          currentPoint = dragStart;
          w = dragElement.width();
          h = dragElement.height();
          dragElement.css("width", w);
          dragElement.css("height", h);
          dragElement.css("position", "absolute");
          $("body").append(dragElement);
          updateState(e);
          return dragElement;
        });

        element.on("drag", {
          distance: 2
        }, function(e) {
          updateState(e);
          return;
        });

        element.on("dragend", function(e) {
          for (var [i, _el] of items.toArray().entries()) {
            var el = $(_el);
            el.css("width", "");
            el.css("height", "");
            el.css("top", "");
            el.css("left", "");
            el.css("position", "");
          }

          elementParent.append(dragElement);
          dragElement.css("width", "");
          dragElement.css("height", "");
          dragElement.css("position", "");
          var container = element.find(".vlist");
          container.css("width", "");
          container.css("height", "");

          if (attrs.manualMove != null) {
            Util.safeApply(scope, function() {
              return scope.manualMove({
                from: dragStart,
                to: currentPoint
              });
            });
          } else if (currentPoint !== dragStart) {
            Util.safeApply(scope, function() {
              el = scope.model.splice(dragStart, 1)[0];
              return scope.model.splice(currentPoint, 0, el);
            });
          }

          return;
        });

        return this;
      }
    ]
  };
});

ngModule.directive("vlistCellTransclude", function() {
  return {
    require: "^vlistCell",

    link: function(scope, element, attrs, controller) {
      return controller.transclude(function(clone, newScope) {
        newScope.vlo = scope.vlo;

        newScope.$on("$destroy", (scope.$watch("$index", function(v) {
          return newScope.$index = v;
        })));

        return element.append(clone);
      });
    }
  };
});

ngModule.directive("hlistCellTransclude", function() {
  return {
    require: "^hlistCell",

    link: function(scope, element, attrs, controller) {
      return controller.transclude(function(clone, newScope) {
        newScope.hlo = scope.hlo;

        newScope.$on("$destroy", (scope.$watch("$index", function(v) {
          return newScope.$index = v;
        })));

        return element.append(clone);
      });
    }
  };
});

ngModule.directive("hlistCell", function() {
  return {
    template: templateHlistCell(),
    restrict: "E",

    scope: {
      model: "=bind",
      separator: "@separator",
      reorders: "&reorders",
      userdata: "&userdata",
      dropGroup: "@dropGroup",
      groupTest: "&groupTest",
      groupReplaceTest: "&groupReplaceTest",
      canDrop: "&canDrop",
      canReplace: "&canReplace",
      manualReplace: "&manualReplace",
      manualMove: "&manualMove",
      dragStartFn: "&onStartDrag",
      dragEndFn: "&onEndDrag",
      replaceClass: "@",
      replaceExtensions: "@",
      extensionElement: "@",
      extensionElementLast: "@"
    },

    transclude: true,

    controller: [
      "$scope",
      "$element",
      "$attrs",
      "$parse",
      "$transclude",
      function(scope, element, attrs, $parse, $transclude) {
        var dragPointY;
        var pl;
        this.transclude = $transclude;

        if ((attrs.placeholder != null)) {
          pl = $("<div class=\"hlist-placeholder " + attrs.placeholder + "\"></div>");
          pl.appendTo(element);

          scope.$watch("model.length == 0", function(v) {
            if (v) {
              return pl.addClass("hlist-empty");
            } else {
              return pl.removeClass("hlist-empty");
            }
          });
        }

        scope.isMovable = function() {
          return attrs.reorders != null && scope.reorders(scope.$parent) && (scope.model.length > 1 || attrs.dropGroup != null);
        };

        var currentPoint = null;
        var dragElement = null;
        var $canvas = null;
        var $line = null;
        var dragPointX = dragPointY = 0;
        var dragStart = null;
        var rectangleList = [];

        var buildRectangleList = function() {
          var lists;
          var fromInstance;
          var rl = rectangleList = [];

          var makeInstance = function(s) {
            return {
              ud: s.userdata(),
              model: s.model
            };
          };

          scope.fromInstance = fromInstance = makeInstance(scope);

          if (!(attrs.dropGroup != null)) {
            lists = [element[0]];
          } else {
            lists = $("hlist-cell");
          }

          return (() => {
            var a;
            var last;
            var lastIndex;
            var offsn;
            var el;
            var extVect;

            for (var list of lists) {
              var sc = $(list).isolateScope();

              var instance = (() => {
                if (sc === scope) {
                  return fromInstance;
                } else {
                  return makeInstance(sc);
                }
              })();

              if (attrs.dropGroup != null && sc.dropGroup !== scope.dropGroup) {
                continue;
              }

              var params = {
                fromList: fromInstance,
                toList: instance
              };

              var canMove = !(attrs.groupTest != null) || scope.groupTest(params);

              var canReplace = (() => {
                if (attrs.groupReplaceTest != null) {
                  return scope.groupReplaceTest(params);
                } else {
                  return attrs.canReplace != null;
                }
              })();

              var init = rl.length;
              var items = $(list).find(".item");

              if (canMove && !items.length) {
                items.push($(list).find(".placeholder")[0]);
              }

              if (canReplace && sc.replaceExtensions) {
                extVect = $(sc.replaceExtensions);
              } else {
                extVect = [];
              }

              if (canMove || canReplace) {
                for (var [i, item] of items.toArray().entries()) {
                  var $item = $(item);
                  var offs = $item.offset();
                  var ow = $item.outerWidth();
                  var oh = $item.outerHeight();

                  rl.push({
                    top: offs.top,
                    left: offs.left,
                    width: ow,
                    height: oh,
                    index: i,
                    replace: canReplace,

                    elem: (() => {
                      if (canReplace) {
                        return $item;
                      } else {
                        return null;
                      }
                    })(),

                    move: canMove,
                    instance: instance
                  });

                  if (canReplace && i < extVect.length) {
                    el = $(extVect[i]);
                    offsn = el.offset();

                    rl.push({
                      top: offsn.top,
                      left: offsn.left,
                      width: el.outerWidth(),
                      height: el.outerHeight(),
                      index: i,
                      replace: true,
                      elem: $item,
                      move: false,
                      instance: instance
                    });
                  }
                }
              }

              if (canMove) {
                init = rl[init];
                lastIndex = rl.length - 1;
                last = rl[lastIndex];

                if ($(items[0]).hasClass("placeholder")) {
                  init.empty = true;
                  init.replace = false;
                }

                if (sc.extensionElement != null && sc.extensionElement !== "") {
                  a = $(sc.extensionElement);

                  for (var item of a) {
                    $item = $(item);
                    offs = $item.offset();

                    rl.push({
                      top: offs.top,
                      left: offs.left,
                      width: $item.outerWidth(),
                      height: $item.outerHeight(),
                      lineTop: init.top,
                      lineLeft: init.left,
                      lineHeight: init.height,
                      empty: true,
                      move: true,
                      index: 0,
                      instance: instance
                    });
                  }
                }

                if (sc.extensionElementLast != null && sc.extensionElementLast !== "") {
                  a = $(sc.extensionElementLast);

                  for (var item of a) {
                    $item = $(item);
                    offs = $item.offset();

                    var left = (() => {
                      if (last.empty) {
                        return last.left;
                      } else {
                        return last.left + last.width;
                      }
                    })();

                    rl.push({
                      top: offs.top,
                      left: offs.left,
                      width: $item.outerWidth(),
                      height: $item.outerHeight(),
                      lineTop: last.top,
                      lineLeft: left,
                      lineHeight: last.height,
                      empty: true,
                      move: true,
                      index: lastIndex,
                      instance: instance
                    });
                  }
                }
              }
            }
          })();
        };

        var getCurrentPoint = function(x, y) {
          for (var rect of rectangleList) {
            var w = rect.width;
            var h = rect.height;
            var t = rect.top;
            var l = rect.left;

            if (y < t || y > t + h || x < l || x > l + w) {
              continue;
            }

            var r = {
              x: l,
              y: t,
              height: h,
              width: w,
              replace: rect.replace,
              index: rect.index,
              instance: rect.instance,
              elem: rect.elem
            };

            if (rect.replace && rect.move) {
              if (x < l + w * (1 / 3)) {
                r.replace = false;
              }

              if (x > l + w * (2 / 3)) {
                r.replace = false;
                r.x += w;
                r.index++;
              }
            }

            if (!rect.replace && rect.move && !rect.empty) {
              if (x > l + w * 0.5) {
                r.x += w;
                r.index++;
              }
            }

            if (rect.lineTop != null) {
              r.y = rect.lineTop;
            }

            if (rect.lineLeft != null) {
              r.x = rect.lineLeft;
            }

            if (rect.lineHeight != null) {
              r.height = rect.lineHeight;
            }

            if (rect.lineWidth != null) {
              r.width = rect.lineWidth;
            }

            return r;
          }

          return null;
        };

        var updateCanvas = function(e) {
          var displayNew;
          var displayOld;
          var repCls;
          var pnt;

          if ($canvas) {
            $canvas.css("left", e.pageX - dragPointX);
            $canvas.css("top", e.pageY - dragPointY);
          }

          if ($line) {
            pnt = getCurrentPoint(e.pageX, e.pageY);

            if (pnt && pnt.instance === scope.fromInstance && (pnt.index === dragStart || (!pnt.replace && pnt.index === dragStart + 1))) {
              pnt = null;
            }

            repCls = attrs.replaceClass != null;
            displayOld = currentPoint != null && !(repCls && currentPoint.replace);
            displayNew = pnt != null && !(repCls && pnt.replace);

            if (repCls) {
              if (currentPoint != null && currentPoint.replace) {
                currentPoint.elem.removeClass(scope.replaceClass);
              }

              if (pnt != null && pnt.replace) {
                pnt.elem.addClass(scope.replaceClass);
              }
            }

            if (displayOld && !displayNew) {
              $line.css("display", "none");
            } else if (displayNew && !displayOld) {
              $line.css("display", "block");
            }

            if (pnt && displayNew) {
              $line.css("left", pnt.x + "px");
              $line.css("top", pnt.y + "px");
              $line.css("height", pnt.height + "px");
              $line.css("width", (pnt.replace ? pnt.width : 0));
              $line.css("opacity", (pnt.replace ? 0.5 : 1));
            }

            return currentPoint = pnt;
          }
        };

        element.on("draginit", function(e) {
          var a;
          var el = $(e.target);
          dragElement = null;

          if (el.hasClass("moveable-true")) {
            dragElement = el;
          } else if ((a = el.parents(".moveable-true")).length) {
            dragElement = a;
          }

          if (dragElement) {
            return element;
          }

          return false;
        });

        element.on("dragstart", function(e) {
          dragStart = dragElement.index();
          var scrollX = window.pageXOffset;
          var scrollY = window.pageYOffset;
          buildRectangleList();

          html2canvas(dragElement[0], {
            scale: (window.devicePixelRatio ? window.devicePixelRatio : 1),

            onrendered: function(canvas) {
              window.scrollTo(scrollX, scrollY);
              var elW = dragElement.outerWidth();
              var elH = dragElement.outerHeight();

              var scale = {
                x: canvas.width / elW,
                y: canvas.height / elH
              };

              $canvas = $(canvas);
              $canvas.css("width", elW);
              $canvas.css("height", elH);
              $canvas.css("position", "absolute");
              $canvas.css("opacity", "0.6");
              var offs = dragElement.offset();
              dragPointX = e.pageX - offs.left;
              dragPointY = e.pageY - offs.top;
              dragElement.css("opacity", "0.4");
              $line = $(document.createElement("div"));
              $line.css("position", "absolute");
              $line.css("border", "1px solid #0088cc");
              $line.css("background-color", "#0088cc");
              $line.css("border-radius", "1px");
              $line.css("width", "0px");
              $line.css("height", "0px");
              $line.css("display", "none");
              $(document.body).append($line);
              $(document.body).append($canvas);
              updateCanvas(e);
              return;
            }
          });

          Util.safeApply(scope, function() {
            return scope.dragStartFn({
              list: scope.fromInstance,
              index: dragStart
            });
          });

          return dragElement;
        });

        element.on("drag", {
          distance: 2
        }, function(e) {
          updateCanvas(e);
          return;
        });

        element.on("dragend", function(e) {
          var same;
          var idx;

          if ($canvas) {
            $canvas.remove();
            $canvas = null;
          }

          dragElement.css("opacity", "1");

          if ($line) {
            $line.remove();
            $line = null;
          }

          if (currentPoint != null) {
            if (currentPoint.replace) {
              if (attrs.replaceClass != null) {
                currentPoint.elem.removeClass(scope.replaceClass);
              }

              if (attrs.manualReplace != null) {
                Util.safeApply(scope, function() {
                  return scope.manualReplace({
                    fromList: scope.fromInstance,
                    toList: currentPoint.instance,
                    fromIndex: dragStart,
                    toIndex: currentPoint.index
                  });
                });
              } else if (currentPoint.instance !== scope.fromInstance || dragStart !== currentPoint.index) {
                Util.safeApply(scope, function() {
                  var a = scope.model[dragStart];
                  var b = currentPoint.instance.model[currentPoint.index];
                  scope.model[dragStart] = b;
                  return currentPoint.instance.model[currentPoint.index] = a;
                });
              }
            } else if (attrs.manualMove != null) {
              Util.safeApply(scope, function() {
                return scope.manualMove({
                  fromList: scope.fromInstance,
                  toList: currentPoint.instance,
                  fromIndex: dragStart,
                  toIndex: currentPoint.index
                });
              });
            } else {
              idx = currentPoint.index;
              same = currentPoint.instance === scope.fromInstance;

              if (same && idx > dragStart) {
                idx--;
              }

              if (!same || idx !== dragStart) {
                Util.safeApply(scope, function() {
                  var el = scope.model.splice(dragStart, 1)[0];
                  return currentPoint.instance.model.splice(idx, 0, el);
                });
              }
            }
          }

          Util.safeApply(scope, function() {
            return scope.dragEndFn({
              list: scope.fromInstance,
              index: dragStart
            });
          });

          rectangleList = [];
          currentPoint = null;
          return;
        });

        return this;
      }
    ]
  };
});
