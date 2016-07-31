export function parseUrl(url) {
  var a = document.createElement("a");
  a.href = url;
  return a;
}

export function deepCopy(v, exceptions = []) {
  var aux = {};

  for (var exp of exceptions) {
    aux[exp] = eval("v." + exp);
    eval("v." + exp + "=null");
  }

  var vv = JSON.parse(JSON.stringify(v));

  for (var exp of exceptions) {
    var caux = aux[exp];
    eval("v." + exp + "=caux");
    eval("vv." + exp + "=caux");
  }

  return vv;
}

export function unpackCycles(a, index) {
  for (var [i, v] of a.entries()) {
    if (typeof (v) === "number") {
      a[i] = index[v];
    }
  }
}

export function unpackCycle(a, index) {
  if (typeof a === "number" && index) {
    return index[a] || null;
  }
  return null;
}

export function packCycle(a, index) {
  return index.indexOf(a);
}

export function packCycles(a, index) {
  var r = [];
  for (var v of a) {
    r.push(index.indexOf(v));
  }
  return r;
}

export function arrayRemove(a, obj) {
  var idx = a.indexOf(obj);

  if (idx !== -1) {
    a.splice(idx, 1);
  }

  return;
}

export function getObjectClass(obj) {
  var arr;

  if (obj && obj.constructor && obj.constructor.toString) {
    arr = obj.constructor.toString().match(/function\s*(\w+)/);

    if (arr && arr.length === 2) {
      return arr[1];
    }
  }

  return undefined;
}

export function getClass(constructor) {
  var arr;

  if (constructor && constructor.toString) {
    arr = constructor.toString().match(/function\s*(\w+)/);

    if (arr && arr.length === 2) {
      return arr[1];
    }
  }

  return undefined;
}

export function copyObject(orig, ignores) {
  (ignores != null ? ignores : ignores = []);
  ignores.push("$$hashKey");
  var model = {};

  for (var [key, value] of Object.entries(orig)) {
    model[key] = value;
  }

  for (var key of ignores) {
    model[key] = undefined;
  }

  return model;
}

export function safeApply(scope, fn) {
  if (scope.$$phase || scope.$root.$$phase) {
    fn();
  } else {
    scope.$apply(fn);
  }

  return;
}

export function decimalsOf(v, maxDecimals = 2) {
  var s = v.toFixed(maxDecimals);
  var n = s.length;
  var dec = maxDecimals;

  while (n && dec && s[n - 1] === "0") {
    dec--;
    n--;
  }

  return dec;
}

export function installScopeUtils(scope) {
  scope.yesNoInherit = function(v, y, n, i) {
    if (v === null) {
      return i;
    } else if (v) {
      return y;
    } else {
      return n;
    }
  };

  scope.yesNo = function(v, y, n) {
    return (v ? y : n);
  };

  scope.parseInt = function(s) {
    if (s === "") {
      return 0;
    }

    return parseInt(s);
  };

  scope.parseFloat = function(s) {
    if (s === "") {
      return 0;
    }

    return parseFloat(s);
  };

  scope.truncFloat = function(v, prec) {
    var s = v.toFixed(prec);

    if (s.indexOf(".") !== -1) {
      return s.replace(/\.?0*$/, "");
    } else {
      return s;
    }
  };

  scope.toFixed = function(v, prec) {
    return v.toFixed(prec);
  };

  scope.validateMinMax = function(v, min, max) {
    return min <= v && v <= max;
  };

  scope.eliminateNil = function(a) {
    if (!(typeof a !== "undefined" && a !== null)) {
      return "";
    }

    return a;
  };

  scope.namePlaceholder = function(a, p = "") {
    if (!(typeof a !== "undefined" && a !== null)) {
      return {
        name: p
      };
    }

    return a;
  };

  scope.nilPlaceholder = function(a, p) {
    if (!(typeof a !== "undefined" && a !== null)) {
      return p;
    }

    return a;
  };

  return;
}

export function focusableElement(element, first = true) {
  var minItem = null;
  var minIndex = (first ? 1000001 : 0);

  var traverse = function(index, el) {
    var focusable;

    if ($(el).css("display") === "none" || $(el).css("visibility") === "hidden") {
      return;
    }

    var tabIndex = parseInt(el.getAttribute("tabindex"));

    if (isNaN(tabIndex)) {
      focusable = _.contains(["INPUT", "TEXTAREA", "OBJECT", "BUTTON"], el.tagName);
      focusable = focusable || (_.contains(["A", "AREA"], el.tagName) && el[0].getAttribute("href"));

      tabIndex = (() => {
        if (focusable) {
          return 0;
        } else {
          return -1;
        }
      })();
    }

    if (first && tabIndex <= 0) {
      tabIndex = 1000000 - tabIndex;
    }

    if (((() => {
      if (first) {
        return tabIndex < minIndex;
      } else {
        return tabIndex >= minIndex;
      }
    })())) {
      minIndex = tabIndex;
      minItem = el;
    }

    return $(el).children().each(traverse);
  };

  for (var el of element) {
    traverse(0, el);
  }

  return minItem;
}

export function naturalSort(a, b) {
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  var sre = /(^[ ]*|[ ]*$)/g;
  var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  var hre = /^0x[0-9a-f]+$/i;
  var ore = /^0/;
  var x = a.toString().replace(sre, "") || "";
  var y = b.toString().replace(sre, "") || "";
  var xN = x.replace(re, "\u0000$1\u0000").replace(/\0$/, "").replace(/^\0/, "").split("\u0000");
  var yN = y.replace(re, "\u0000$1\u0000").replace(/\0$/, "").replace(/^\0/, "").split("\u0000");
  var xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x));
  var yD = (parseInt(y.match(hre)) || xD) && y.match(dre) && Date.parse(y) || null;

  if (yD) {
    if (xD < yD) {
      return -1;
    }

    if (xD > yD) {
      return 1;
    }
  }

  for (var cLoc of (function() {
      var results = [];

      for (var i = 0, ref = Math.max(xN.length, yN.length); (0 <= ref ? i < ref : i > ref); (0 <= ref ? i++ : i--)) {
          results.push(i);
      }

      return results;
  }).apply(this)) {
    var oFxNcL = !(xN[cLoc] || "").match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    var oFyNcL = !(yN[cLoc] || "").match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
      return (() => {
        if (isNaN(oFxNcL)) {
          return 1;
        } else {
          return -1;
        }
      })();
    } else if (typeof oFxNcL !== typeof oFyNcL) {
      oFxNcL += "";
      oFyNcL += "";
    }

    if (oFxNcL < oFyNcL) {
      return -1;
    }

    if (oFxNcL > oFyNcL) {
      return 1;
    }
  }

  return 0;
}

export function extendScope(s) {
  s.disableDigest = function() {
    this.$$digestDisabled = true;
    return;
  };

  return s.enableDigest = function() {
    this.$$digestDisabled = false;
    this.$apply(function() {});
    return;
  };
}
