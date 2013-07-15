(function() {
  define(['util', 'ballot', 'underscore'], function(Util, Ballot) {
    var Round;
    return Round = (function() {
      function Round(tournament, other) {
        var ballot, i, judge, key, room, team, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
        this.tournament = tournament;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.id == null) {
          this.id = Math.floor(Math.random() * 100000000);
        }
        if (this.tableOpts == null) {
          this.tableOpts = {};
        }
        if (this.judges == null) {
          this.judges = [];
        }
        if (this.teams == null) {
          this.teams = [];
        }
        if (this.rooms == null) {
          this.rooms = [];
        }
        if (this.ballots == null) {
          this.ballots = [];
        }
        if (this.rankFrom == null) {
          this.rankFrom = {
            all: true
          };
        }
        if (other) {
          _ref = this.ballots;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            ballot = _ref[i];
            this.ballots[i] = new Ballot(this, ballot);
          }
        } else {
          _ref1 = this.tournament.teams;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            team = _ref1[_j];
            this.registerTeam(team);
          }
          _ref2 = this.tournament.judges;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            judge = _ref2[_k];
            this.registerJudge(judge);
          }
          _ref3 = this.tournament.rooms;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            room = _ref3[_l];
            this.registerRoom(room);
          }
        }
      }

      Round.prototype.unpackCycles = function() {
        var ballot, _i, _len, _ref, _results;
        Util.unpackCycles(this.teams, this.tournament.teams);
        Util.unpackCycles(this.judges, this.tournament.judges);
        Util.unpackCycles(this.rooms, this.tournament.rooms);
        _ref = this.ballots;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ballot = _ref[_i];
          _results.push(ballot.unpackCycles());
        }
        return _results;
      };

      Round.prototype.previousRounds = function() {
        var r, round, _i, _j, _len, _len1, _ref, _ref1;
        r = [];
        if (this.rankFrom.all) {
          _ref = this.tournament.rounds;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            round = _ref[_i];
            if (round === this) {
              break;
            }
            if (round.paired) {
              r.push(round);
            }
          }
        } else {
          _ref1 = this.tournament.rounds;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            round = _ref1[_j];
            if (round.paired && this.rankFrom[round.id]) {
              r.push(round);
            }
          }
        }
        return r;
      };

      Round.prototype.registerJudge = function(judge) {
        var id;
        id = this.id;
        if (judge.rounds[id] == null) {
          judge.rounds[id] = {
            participates: true,
            locked: false
          };
          return this.judges.push(judge);
        }
      };

      Round.prototype.unregisterJudge = function(judge) {
        var idx;
        idx = this.judges.indexOf(judge);
        if (idx !== -1) {
          return this.judges.splice(idx, 1);
        }
      };

      Round.prototype.registerTeam = function(team) {
        var id;
        id = this.id;
        if (team.rounds[id] == null) {
          team.rounds[id] = {
            participates: true,
            locked: false
          };
          return this.teams.push(team);
        }
      };

      Round.prototype.unregisterTeam = function(team) {
        var idx;
        idx = this.teams.indexOf(team);
        if (idx !== -1) {
          return this.teams.splice(idx, 1);
        }
      };

      Round.prototype.registerRoom = function(room) {
        var id;
        id = this.id;
        if (room.rounds[id] == null) {
          room.rounds[id] = {
            participates: true,
            locked: false
          };
          return this.rooms.push(room);
        }
      };

      Round.prototype.unregisterRoom = function(room) {
        var idx;
        idx = this.rooms.indexOf(room);
        if (idx !== -1) {
          return this.rooms.splice(idx, 1);
        }
      };

      Round.prototype.sortByRank = function(array) {
        return console.log("sorting by rank: ", array);
      };

      Round.prototype.pairingTeams = function() {
        var id, teams;
        id = this.id;
        return teams = _.filter(this.teams, function(o) {
          return o.rounds[id].participates;
        });
      };

      Round.prototype.pair = function(opts) {
        var i, id, pairTeams, rooms, roomsIdx, roomsL, teams, _i, _ref,
          _this = this;
        teams = this.pairingTeams();
        if (opts.algorithm) {
          this.sortByRank(teams);
        } else {
          teams = _.shuffle(teams);
        }
        if (teams.length & 1) {
          teams.push(null);
        }
        id = this.id;
        rooms = _.filter(this.rooms, function(o) {
          return o.rounds[id].participates;
        });
        console.log(rooms);
        roomsIdx = 0;
        roomsL = rooms.length;
        pairTeams = function(a, b, balance) {
          var ballot;
          if (balance == null) {
            balance = true;
          }
          ballot = new Ballot(_this);
          ballot.prop = a;
          ballot.opp = b;
          if (roomsIdx < roomsL) {
            ballot.room = rooms[roomsIdx];
          }
          roomsIdx++;
          return _this.ballots.push(ballot);
        };
        switch (opts.algorithm) {
          case 0:
          case 3:
            for (i = _i = 0, _ref = teams.length; _i < _ref; i = _i += 2) {
              pairTeams(teams[i], teams[i + 1], opts.balance);
            }
        }
        return this.paired = true;
      };

      Round.prototype.shuffleRooms = function() {
        var ballot, ballots, i, rooms, _i, _len, _results;
        ballots = _.shuffle(this.ballots);
        rooms = _.map(this.ballots, function(o) {
          return o.room;
        });
        _results = [];
        for (i = _i = 0, _len = ballots.length; _i < _len; i = ++_i) {
          ballot = ballots[i];
          ballot.room = rooms[i];
          _results.push(this.ballots[i] = ballot);
        }
        return _results;
      };

      Round.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['tournament']);
        model.teams = Util.packCycles(this.teams, this.tournament.teams);
        model.judges = Util.packCycles(this.judges, this.tournament.judges);
        model.rooms = Util.packCycles(this.rooms, this.tournament.rooms);
        return model;
      };

      Round.prototype.destroy = function() {
        var id, judge, room, team, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
        id = this.id;
        _ref = this.tournament.teams;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          team = _ref[_i];
          delete team.rounds[id];
        }
        _ref1 = this.tournament.judges;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          judge = _ref1[_j];
          delete judge.rounds[id];
        }
        _ref2 = this.tournament.rooms;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          room = _ref2[_k];
          _results.push(delete room.rounds[id]);
        }
        return _results;
      };

      Round.allAlgos = [0, 1, 2, 3];

      Round.initialAlgos = [0, 1];

      Round.algoName = ['Random', 'Manual', 'High-Low', 'Power Pairing'];

      return Round;

    })();
  });

}).call(this);
