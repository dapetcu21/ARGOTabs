var Util = require("../core/util");
var UUID = require("./uuid");

class Judge {
  constructor(tournament, other) {
    this.tournament = tournament;

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value;
      }
    }

    (this.name != null ? this.name : this.name = "");
    (this.rank != null ? this.rank : this.rank = 0);
    (this.id != null ? this.id : this.id = UUID("judge_"));
    (this.rounds != null ? this.rounds : this.rounds = {});

    if (!other) {
      for (var round of this.tournament.rounds) {
        round.registerJudge(this);
      }
    }
  }

  static rankStrings = ["A", "B", "C", "D"];
  static ranks = [0, 1, 2, 3, 32];
  static shadowRank = 32;
  static censoredRank = 31;

  unpackCycles() {
    this.club = Util.unpackCycle(this.club, this.tournament.clubs);

    return (() => {
      for (var round of this.tournament.rounds) {
        var opts = this.rounds[round.id];

        if (opts != null) {
          opts.ballot = Util.unpackCycle(opts.ballot, round.ballots);
        }
      }
    })();
  }

  toJSON() {
    var mopts;
    var model = Util.copyObject(this, ["tournament"]);
    model.club = Util.packCycle(this.club, this.tournament.clubs);
    model.rounds = {};

    for (var round of this.tournament.rounds) {
      var opts = this.rounds[round.id];

      if (opts != null) {
        mopts = Util.copyObject(opts, []);
        mopts.ballot = Util.packCycle(mopts.ballot, round.ballots);
      }

      model.rounds[round.id] = mopts;
    }

    return model;
  }

  destroy() {
    for (var round of this.tournament.rounds) {
      round.unregisterJudge(this);
    }

    if (this.club) {
      this.club.removeJudge(this);
    }

    return this.tournament.destroyEntityInJudgeRules(this);
  }
}

for (let i = 4; i <= 30; i++) {
  Judge.rankStrings.push(null);
}
Judge.rankStrings.push("Censored");
Judge.rankStrings.push("Shd");

module.exports = Judge;
