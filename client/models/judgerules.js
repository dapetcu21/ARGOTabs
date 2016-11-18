const Util = require('../core/util');
const Judge = require('./judge');
const Team = require('./team');
const Club = require('./club');

class JudgeRules {
  newCriteria(judge, verb, team) {
    return {
      judge: judge,
      verb: verb,
      team: team,
      toJSON: this.criterionPackFn()
    };
  }

  criterionPackFn() {
    var trn = this.tournament;

    return function() {
      var r = {
        verb: this.verb
      };

      if (this.judge === null) {
        r.judge = r.judgeType = -1;
      }

      if (typeof this.judge === "number") {
        r.judge = this.judge;
        r.judgeType = 0;
      } else if (this.judge instanceof Judge) {
        r.judge = Util.packCycle(this.judge, trn.judges);
        r.judgeType = 1;
      } else if (this.judge instanceof Club) {
        r.judge = Util.packCycle(this.judge, trn.clubs);
        r.judgeType = 2;
      }

      if (this.team === null) {
        r.team = r.teamType = -1;
      }

      if (typeof this.team === "number") {
        r.team = this.team;
        r.teamType = 0;
      } else if (this.team instanceof Team) {
        r.team = Util.packCycle(this.team, trn.teams);
        r.teamType = 1;
      } else if (this.team instanceof Club) {
        r.team = Util.packCycle(this.team, trn.clubs);
        r.teamType = 2;
      }

      return r;
    };
  }

  unpackCriterion(c) {
    var trn = this.tournament;

    if (c.judgeType === -1) {
      c.judge = null;
    } else if (c.judgeType === 1) {
      c.judge = Util.unpackCycle(c.judge, trn.judges);
    } else if (c.judgeType === 2) {
      c.judge = Util.unpackCycle(c.judge, trn.clubs);
    }

    delete c.judgeType;

    if (c.teamType === -1) {
      c.team = null;
    } else if (c.teamType === 1) {
      c.team = Util.unpackCycle(c.team, trn.teams);
    } else if (c.teamType === 2) {
      c.team = Util.unpackCycle(c.team, trn.clubs);
    }

    delete c.teamType;
    c.toJSON = this.criterionPackFn();
    return;
  }

  static judgeLabel(judge) {
    if (judge === 0) {
      return "All judges";
    }

    if (judge === 1) {
      return "Unaffiliated judges";
    }

    if (judge instanceof Club) {
      return "Judges from " + judge.name;
    }

    if (judge instanceof Judge) {
      return judge.name;
    }

    return "!!ERROR!!";
  }

  static teamLabel(team) {
    if (team === 0) {
      return "any team";
    }

    if (team === 1) {
      return "teams from their club";
    }

    if (team === 2) {
      return "when both teams are from their club";
    }

    if (team instanceof Club) {
      return "teams from " + team.name;
    }

    if (team instanceof Team) {
      return team.name;
    }

    return "!!ERROR!!";
  }

  static verbLabel = ["can judge", "can't judge"];
  static verbResult = [true, false];

  judgeArray() {
    return [0, 1].concat(this.tournament.clubs, this.tournament.judges);
  }

  teamArray() {
    return [0, 1, 2].concat(this.tournament.clubs, this.tournament.teams);
  }

  constructor(tournament, criteria = []) {
    var criteria;
    this.tournament = tournament;

    if (criteria.criteria != null) {
      criteria = criteria.criteria;
    }

    this.criteria = criteria;

    for (var criterion of criteria) {
      this.unpackCriterion(criterion);
    }
  }

  evalCriterion(crit, judge, ballot) {
    var ta = ballot.teams[0];
    var tb = ballot.teams[1];

    if (!(ta != null) || !(tb != null) || !(typeof judge !== "undefined" && judge !== null)) {
      return 2;
    }

    if (!(crit.team != null) || !(crit.judge != null)) {
      return 2;
    }

    if (crit.judge === 1 && judge.club != null) {
      return 2;
    }

    if (crit.judge instanceof Club && judge.club !== crit.judge) {
      return 2;
    }

    if (crit.judge instanceof Judge && judge !== crit.judge) {
      return 2;
    }

    var vrb = (() => {
      if (crit.verb === 0) {
        return true;
      } else {
        return false;
      }
    })();

    var relevantTeam = function(t) {
      if (crit.team === 0) {
        return true;
      }

      if (crit.team === 1 && judge.club != null && judge.club === t.club) {
        return true;
      }

      if (crit.team === 2 && judge.club != null && ta.club === tb.club && ta.club === judge.club) {
        return true;
      }

      if (crit.team instanceof Club && t.club === crit.team) {
        return true;
      }

      if (crit.team instanceof Team && t === crit.team) {
        return true;
      }

      return false;
    };

    if (crit.team === 2 && judge.club != null && ta.club === tb.club && ta.club === judge.club) {
      return vrb;
    }

    if (relevantTeam(ta) || relevantTeam(tb)) {
      return vrb;
    }

    return 2;
  }

  isCompatible(judge, ballot, next) {
    for (var criterion of this.criteria) {
      var e = this.evalCriterion(criterion, judge, ballot);

      if ((e === true) || (e === false)) {
        return e;
      }
    }

    if (typeof next !== "undefined" && next !== null) {
      return next.isCompatible(judge, ballot, null);
    }

    return true;
  }

  compatibilityFactor(judge, ballot, next) {
    var fact = 0;

    for (var criterion of this.criteria) {
      var e = this.evalCriterion(criterion, judge, ballot);

      if ((e === false)) {
        fact++;
      }

      if ((e === true)) {
        return fact;
      }
    }

    if (typeof next !== "undefined" && next !== null) {
      return fact + next.compatibilityFactor(judge, ballot, null);
    }

    return fact;
  }

  toJSON() {
    return {
      criteria: this.criteria
    };
  }

  static mainRules(tournament, o) {
    return new JudgeRules(tournament, (() => {
      if (typeof o !== "undefined" && o !== null) {
        return o;
      } else {
        return [{
          judge: 0,
          verb: 0,
          team: 2
        }, {
          judge: 0,
          verb: 1,
          team: 1
        }];
      }
    })());
  }

  addNewRule() {
    return this.criteria.unshift(this.newCriteria(0, 1, 0));
  }

  removeRule(index) {
    return this.criteria.splice(index, 1);
  }

  entityDestroyed(e) {
    if (!(typeof e !== "undefined" && e !== null)) {
      return;
    }

    return (() => {
      for (var criterion of this.criteria) {
        if (criterion.judge === e) {
          criterion.judge = null;
        }

        if (criterion.team === e) {
          criterion.team = null;
        }
      }
    })();
  }
}

module.exports = JudgeRules;
