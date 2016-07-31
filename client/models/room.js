const Util = require('../core/util');
const UUID = require('./uuid');

class Room {
  constructor(tournament, other) {
    this.tournament = tournament;

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value;
      }
    }

    (this.name != null ? this.name : this.name = "");
    (this.id != null ? this.id : this.id = UUID("room_"));
    (this.floor != null ? this.floor : this.floor = "");
    (this.rounds != null ? this.rounds : this.rounds = {});

    if (!other) {
      for (var round of this.tournament.rounds) {
        round.registerRoom(this);
      }
    }
  }

  unpackCycles() {
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
    return (() => {
      for (var round of this.tournament.rounds) {
        round.unregisterRoom(this);
      }
    })();
  }
}

module.exports = Room;
