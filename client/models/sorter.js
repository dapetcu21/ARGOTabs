const _ = require('lodash');

const newCrit = function(name, crit, operand = ">", equality = "==") {
  var funcString = "(function(a,b) { if (a." + crit + operand + "b." + crit + ") return -1; if (a." + crit + equality + "b." + crit + ") return 0; return 1; })";
  funcString = funcString.replace(/[ ][ ]+/g, "");

  return {
    name: name,
    id: crit,
    func: eval(funcString),

    toJSON: function() {
      return {
        name: this.name,
        func: funcString,
        id: this.id
      };
    }
  };
};

class Sorter {
  constructor(criteria = []) {
    var criteria;

    if (criteria.criteria != null) {
      criteria = criteria.criteria;
    }

    this.criteria = criteria;

    for (var criterion of criteria) {
      if (!typeof (criterion.id != null)) {
        criterion.id = Sorter.legacyNames[criterion.name];
      }

      if (typeof criterion.func === "string") {
        criterion.funcString = criterion.func;
        criterion.func = eval(criterion.func);

        criterion.toJSON = function() {
          return {
            name: this.name,
            func: this.funcString,
            id: this.id
          };
        };
      }
    }
  }

  compareObjects(a, b) {
    if (!(this.criteria != null)) {
      return true;
    }

    for (var criterion of this.criteria) {
      var r = criterion.func(a, b);

      if (r < 0) {
        return -1;
      }

      if (r > 0) {
        return 1;
      }
    }

    return 0;
  }

  boundComparator() {
    return this.compareObjects.bind(this);
  }

  static sorterFromBlueprint(o, blueprint) {
    if (!(typeof o !== "undefined" && o !== null)) {
      return new Sorter(blueprint);
    }

    if (o.criteria != null) {
      o = o.criteria;
    }

    var visited = {};

    _.each(o, function(crit) {
      return visited[crit.id || Sorter.legacyNames[crit.name]] = true;
    });

    _.each(blueprint, function(crit) {
      if (!visited[crit.id]) {
        return o.push(crit);
      }
    });

    return new Sorter(o);
  }

  static teamRankSorter(o) {
    return Sorter.sorterFromBlueprint(o, [
      newCrit("Ballots", "ballots"),
      newCrit("Score", "score"),
      newCrit("H/L Score", "scoreHighLow"),
      newCrit("Win Margin", "margin"),
      newCrit("Wins", "wins"),
      newCrit("Reply Score", "reply")
    ]);
  }

  static speakerRankSorter(o) {
    return Sorter.sorterFromBlueprint(o, [
      newCrit("Score", "score"),
      newCrit("H/L Score", "scoreHighLow"),
      newCrit("Reply Score", "reply")
    ]);
  }

  static legacyNames = {
    "Ballots": "ballots",
    "Score": "score",
    "H/L Score": "scoreHighLow",
    "Wins": "wins",
    "Reply Score": "reply"
  };
}

module.exports = Sorter;
