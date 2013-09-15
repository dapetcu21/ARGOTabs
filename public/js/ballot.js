(function() {
  define(['util', 'underscore'], function(Util) {
    var Ballot;
    return Ballot = (function() {
      function Ballot(round, other) {
        var key, value;
        this.round = round;
        if (other) {
          for (key in other) {
            value = other[key];
            this[key] = value;
          }
        }
        if (this.prop == null) {
          this.prop = null;
        }
        if (this.opp == null) {
          this.opp = null;
        }
        if (this.room == null) {
          this.room = null;
        }
        if (this.locked == null) {
          this.locked = false;
        }
        if (this.votes == null) {
          this.votes = [];
        }
        if (this.judges == null) {
          this.judges = [];
        }
      }

      Ballot.prototype.getVotesForBallots = function(b) {
        var dv, i, judges, md, n, newVote, votes, _i, _j, _k;
        if (this.votes && this.votes.length) {
          return _.copy(this.votes);
        }
        judges = _.filter(this.judges, function(x) {
          return x.rank !== Judge.shadowRank;
        });
        n = judges.length;
        votes = [];
        newVote = function(judge, bal) {
          var v;
          if (bal == null) {
            bal = 1;
          }
          v = {};
          v.judge = judge;
          v.ballots = bal;
          v.prop = bal;
          v.opp = 0;
          v.scores = [[70, 70, 70, 35], [70, 70, 70, 35]];
          return v;
        };
        if (n) {
          if (n >= b) {
            for (i = _i = 0; 0 <= b ? _i < b : _i > b; i = 0 <= b ? ++_i : --_i) {
              votes.push(newVote(judges[i]));
            }
          } else {
            dv = b / n;
            md = b % n;
            for (i = _j = 0; 0 <= n ? _j < n : _j > n; i = 0 <= n ? ++_j : --_j) {
              votes.push(newVote(judges[i], dv + (i < md ? 1 : 0)));
            }
          }
        } else {
          for (i = _k = 0; 0 <= b ? _k < b : _k > b; i = 0 <= b ? ++_k : --_k) {
            votes.push(newVote(null));
          }
        }
        return votes;
      };

      Ballot.prototype.unpackCycles = function() {
        this.prop = Util.unpackCycle(this.prop, this.round.tournament.teams);
        this.opp = Util.unpackCycle(this.opp, this.round.tournament.teams);
        return this.room = Util.unpackCycle(this.room, this.round.tournament.rooms);
      };

      Ballot.prototype.toJSON = function() {
        var model;
        model = Util.copyObject(this, ['round']);
        model.prop = Util.packCycle(this.prop, this.round.tournament.teams);
        model.opp = Util.packCycle(this.opp, this.round.tournament.teams);
        model.room = Util.packCycle(this.room, this.round.tournament.rooms);
        return model;
      };

      Ballot.prototype.destroy = function() {
        if (this.team) {
          return this.team.removePlayer(this);
        }
      };

      return Ballot;

    })();
  });

}).call(this);
