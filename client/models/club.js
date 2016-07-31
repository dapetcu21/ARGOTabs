const Util = require('../core/util');
const UUID = require('./uuid');

class Club {
  constructor(tournament, other) {
    this.tournament = tournament;

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value;
      }
    }

    (this.name != null ? this.name : this.name = "");
    (this.teams != null ? this.teams : this.teams = []);
    (this.id != null ? this.id : this.id = UUID("club_"));
    (this.judges != null ? this.judges : this.judges = []);
  }

  unpackCycles() {
    Util.unpackCycles(this.teams, this.tournament.teams);
    return Util.unpackCycles(this.judges, this.tournament.judges);
  }

  toJSON() {
    var model = Util.copyObject(this, ["tournament"]);
    model.teams = Util.packCycles(this.teams, this.tournament.teams);
    model.judges = Util.packCycles(this.judges, this.tournament.judges);
    return model;
  }

  removeTeam(team) {
    var index = this.teams.indexOf(team);

    if (index !== -1) {
      return this.teams.splice(index, 1);
    }
  }

  addTeam(team) {
    return this.teams.push(team);
  }

  removeJudge(judge) {
    var index = this.judges.indexOf(judge);

    if (index !== -1) {
      return this.judges.splice(index, 1);
    }
  }

  addJudge(judge) {
    return this.judges.push(judge);
  }

  destroy() {
    for (var team of this.teams) {
      team.club = null;
    }

    for (var judge of this.judges) {
      judge.club = null;
    }

    return this.tournament.destroyEntityInJudgeRules(this);
  }
}

module.exports = Club;
