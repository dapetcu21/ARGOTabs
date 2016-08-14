define([
  "../core/util",
  "./ballot",
  "./judge",
  "./sorter",
  "./judgerules",
  "./team",
  "./uuid"

const Util = require('../core/util');
const Ballot = require('./ballot');
const Judge = require('./judge');
const Sorter = require('./sorter');
const JudgeRules = require('./judgerules');
const Team = require('./team');
const UUID = require('./uuid');

class Round {
  constructor(tournament, other) {
    this.tournament = tournament;

    if (other) {
      for (var [key, value] of Object.entries(other)) {
        this[key] = value;
      }
    }

    (this.id != null ? this.id : this.id = UUID("round_"));
    (this.tableOpts != null ? this.tableOpts : this.tableOpts = {});
    (this.teams != null ? this.teams : this.teams = []);
    (this.judges != null ? this.judges : this.judges = []);
    (this.freeJudges != null ? this.freeJudges : this.freeJudges = []);
    (this.rooms != null ? this.rooms : this.rooms = []);
    (this.freeRooms != null ? this.freeRooms : this.freeRooms = []);
    (this.ballots != null ? this.ballots : this.ballots = []);
    (this.ballotsPerMatch != null ? this.ballotsPerMatch : this.ballotsPerMatch = null);
    (this.maxMainJudges != null ? this.maxMainJudges : this.maxMainJudges = null);
    (this.maxShadowJudges != null ? this.maxShadowJudges : this.maxShadowJudges = null);
    (this.maxPanelSize != null ? this.maxPanelSize : this.maxPanelSize = null);
    (this.inheritPairRank != null ? this.inheritPairRank : this.inheritPairRank = true);
    (this.allowShadows != null ? this.allowShadows : this.allowShadows = null);
    (this.judgeMainPriority != null ? this.judgeMainPriority : this.judgeMainPriority = null);
    (this.judgeMainOrder != null ? this.judgeMainOrder : this.judgeMainOrder = null);
    (this.judgeShadowPriority != null ? this.judgeShadowPriority : this.judgeShadowPriority = null);
    (this.judgeShadowOrder != null ? this.judgeShadowOrder : this.judgeShadowOrder = null);
    (this.judgeShadowReport != null ? this.judgeShadowReport : this.judgeShadowReport = null);
    (this.caMode != null ? this.caMode : this.caMode = true);
    (this.showConflicts != null ? this.showConflicts : this.showConflicts = true);
    (this.showShadowConflicts != null ? this.showShadowConflicts : this.showShadowConflicts = true);
    (this.showRanks != null ? this.showRanks : this.showRanks = true);
    (this.printCAMode != null ? this.printCAMode : this.printCAMode = false);
    this.pairRankSorter = Sorter.teamRankSorter(this.pairRankSorter);
    this.judgeRules = new JudgeRules(this.tournament, this.judgeRules);

    (this.rankFrom != null ? this.rankFrom : this.rankFrom = {
      all: true
    });

    if (other) {
      for (var [i, ballot] of this.ballots.entries()) {
        this.ballots[i] = new Ballot(this, ballot);
      }
    } else {
      for (var team of this.tournament.teams) {
        this.registerTeam(team);
      }

      for (var judge of this.tournament.judges) {
        this.registerJudge(judge);
        judge.rounds[this.id].participates = true;
        this.freeJudges.push(judge);
      }

      for (var room of this.tournament.rooms) {
        this.registerRoom(room);
      }
    }
  }

  ballotsPerMatchSolved() {
    return (this.ballotsPerMatch != null ? this.ballotsPerMatch : this.tournament.ballotsPerMatch);
  }

  maxMainJudgesSolved() {
    return (this.maxMainJudges != null ? this.maxMainJudges : this.tournament.maxMainJudges);
  }

  maxShadowJudgesSolved() {
    return (this.maxShadowJudges != null ? this.maxShadowJudges : this.tournament.maxShadowJudges);
  }

  maxPanelSizeSolved() {
    return (this.maxPanelSize != null ? this.maxPanelSize : this.tournament.maxPanelSize);
  }

  pairRankSorterSolved() {
    return (this.inheritPairRank ? this.tournament.pairRankSorter : this.pairRankSorter);
  }

  allowShadowsSolved() {
    return (this.allowShadows != null ? this.allowShadows : this.tournament.allowShadows);
  }

  judgeMainPrioritySolved() {
    return (this.judgeMainPriority != null ? this.judgeMainPriority : this.tournament.judgeMainPriority);
  }

  judgeMainOrderSolved() {
    return (this.judgeMainOrder != null ? this.judgeMainOrder : this.tournament.judgeMainOrder);
  }

  judgeShadowPrioritySolved() {
    return (this.judgeShadowPriority != null ? this.judgeShadowPriority : this.tournament.judgeShadowPriority);
  }

  judgeShadowOrderSolved() {
    return (this.judgeShadowOrder != null ? this.judgeShadowOrder : this.tournament.judgeShadowOrder);
  }

  judgeShadowReportSolved() {
    return (this.judgeShadowReport != null ? this.judgeShadowReport : this.tournament.judgeShadowReport);
  }

  getName() {
    var idx = this.tournament.rounds.indexOf(this);

    if (idx !== -1) {
      return "Round " + (idx + 1);
    }

    return "<undefined>";
  }

  unpackCycles() {
    Util.unpackCycles(this.teams, this.tournament.teams);
    Util.unpackCycles(this.judges, this.tournament.judges);
    Util.unpackCycles(this.freeJudges, this.tournament.judges);
    Util.unpackCycles(this.rooms, this.tournament.rooms);
    Util.unpackCycles(this.freeRooms, this.tournament.rooms);

    return (() => {
      for (var ballot of this.ballots) {
        ballot.unpackCycles();
      }
    })();
  }

  previousRounds() {
    var r = [];

    if (this.rankFrom.all) {
      for (var round of this.tournament.rounds) {
        if (round === this) {
          break;
        }

        if (round.paired) {
          r.push(round);
        }
      }
    } else {
      for (var round of this.tournament.rounds) {
        if (round.paired && this.rankFrom[round.id]) {
          r.push(round);
        }
      }
    }

    return r;
  }

  previousRound() {
    var r;

    if (this.rankFrom.all) {
      r = null;

      for (var round of this.tournament.rounds) {
        if (round === this) {
          break;
        }

        if (round.paired) {
          r = round;
        }
      }

      return r;
    } else {
      return (() => {
        for (var round of this.tournament.rounds) {
          if (round.paired && this.rankFrom[round.id]) {
            return round;
          }
        }
      })();
    }
  }

  registerJudge(judge) {
    var id = this.id;

    if (!(judge.rounds[id] != null)) {
      judge.rounds[id] = {
        participates: false
      };

      return this.judges.push(judge);
    }
  }

  unregisterJudge(judge) {
    var ropts = judge.rounds[this.id];

    if (ropts != null && ropts.ballot != null) {
      if (ropts.shadow) {
        Util.arrayRemove(ropts.ballot.shadows, judge);
      } else {
        Util.arrayRemove(ropts.ballot.judges, judge);
      }
    }

    Util.arrayRemove(this.judges, judge);
    return Util.arrayRemove(this.freeJudges, judge);
  }

  registerTeam(team) {
    var id = this.id;

    if (!(team.rounds[id] != null)) {
      team.rounds[id] = {
        participates: true
      };

      return this.teams.push(team);
    }
  }

  unregisterTeam(team) {
    return Util.arrayRemove(this.teams, team);
  }

  registerRoom(room) {
    var id = this.id;

    if (!(room.rounds[id] != null)) {
      room.rounds[id] = {
        participates: true
      };

      this.rooms.push(room);
      return this.freeRooms.push(room);
    }
  }

  unregisterRoom(room) {
    var ropts = room.rounds[this.id];

    if (ropts != null && ropts.ballot != null) {
      ropts.ballot.room = null;
    }

    Util.arrayRemove(this.rooms, room);
    return Util.arrayRemove(this.freeRooms, room);
  }

  sortByRank(array, prev = this.previousRounds()) {
    Team.calculateStats(array, prev);
    var sorter = this.pairRankSorterSolved().boundComparator();

    return array.sort(function(a, b) {
      return sorter(a.stats, b.stats);
    });
  }

  sortBallots() {
    return this.ballots.sort(function(a, b) {
      return a.skillIndex - b.skillIndex;
    });
  }

  censor() {
    this.judgeRules = JudgeRules.mainRules(this.tournament);
    this.caMode = false;

    _.each(this.ballots, function(ballot) {
      return delete (ballot.skillIndex = 0);
    });

    return this.ballots.sort(function(a, b) {
      if (!(b.room != null)) {
        return -1;
      }

      if (!(a.room != null)) {
        return 1;
      }

      return Util.naturalSort(a.room.name, b.room.name);
    });
  }

  pairingTeams() {
    var id = this.id;

    return _.filter(this.teams, function(o) {
      return o.rounds[id].participates;
    });
  }

  pairTeams(a, b, skillIndex = 0) {
    var aux;
    var ballot = new Ballot(this);
    ballot.teams[0] = a;
    ballot.teams[1] = b;
    ballot.skillIndex = skillIndex;

    if (!(typeof a !== "undefined" && a !== null) || !(typeof b !== "undefined" && b !== null)) {
      if (!(typeof a !== "undefined" && a !== null)) {
        aux = a;
        a = b;
        b = aux;
        ballot.teams[0] = a;
        ballot.teams[1] = b;
      }

      ballot.locked = true;
    }

    this.ballots.push(ballot);

    if (a) {
      a.rounds[this.id].ballot = ballot;
      a.stats.paired = true;
    }

    if (b) {
      b.rounds[this.id].ballot = ballot;
      b.stats.paired = true;
    }

    return ballot;
  }

  pair(opts) {
    var nbv;
    var j;
    var bu;
    var bp;
    var vbn;
    var pull;
    var tb;
    var ta;
    var vb;
    var brackets;
    var fl;
    var rid;
    var index;
    var minByes;
    var teams = this.pairingTeams();
    var prevRounds = this.previousRounds();
    this.sortByRank(teams, prevRounds);
    var id = this.id;
    var flip = !opts.manualSides || opts.algorithm !== 1;
    var balance = opts.balanceSides;
    (balance != null ? balance : balance = true);

    var pairTeams = (a, b, skillIndex = 0) => {
      var db;
      var da;
      var sb;
      var sa;
      var swp = false;

      if (flip && (typeof a !== "undefined" && a !== null) && (typeof b !== "undefined" && b !== null)) {
        sa = a.stats.side;
        sb = b.stats.side;

        if (sa === sb && opts.sides === 1) {
          da = Math.abs(a.stats.prop - a.stats.opp);
          db = Math.abs(b.stats.prop - b.stats.opp);

          if (da > db) {
            sb = 1 - sb;
          } else if (db > da) {
            sa = 1 - sa;
          }
        }

        if (sa === sb) {
          if (Math.random() > 0.5) {
            swp = true;
          }
        } else if (sa === 1 || sb === 0) {
          swp = true;
        }
      }

      if (swp) {
        return this.pairTeams(b, a, skillIndex);
      } else {
        return this.pairTeams(a, b, skillIndex);
      }
    };

    var bye = null;

    if (teams.length & 1 && opts.algorithm !== 1) {
      if (!opts.algorithm && (opts.randomBye || !prevRounds.length)) {
        bye = teams.splice(Math.floor(Math.random() * teams.length), 1)[0];
      } else {
        minByes = Number.MAX_VALUE;
        index = -1;

        for (var i of (function() {
          var ref;
          var results = [];

          for (var i = ref = teams.length - 1; (ref <= 0 ? i <= 0 : i >= 0); (ref <= 0 ? i++ : i--)) {
              results.push(i);
          }

          return results;
        }).apply(this)) {
          t = teams[i];
          var nB = 0;

          for (var round of prevRounds) {
            try {
              if (!t.rounds[round.id].ballot.teams[1]) {
                nB++;
              }
            } catch (ex) {}
          }

          if (nB < minByes) {
            bye = t;
            index = i;
            minByes = nB;
          }
        }

        teams.splice(index, 1);
      }
    }

    if (opts.sides === 1) {
      for (var team of teams) {
        var prop = team.stats.prop;
        var opp = team.stats.opp;

        if (opp > prop) {
          team.stats.side = 0;
        } else if (prop > opp) {
          team.stats.side = 1;
        }
      }
    } else if (typeof opts.sides === "object") {
      rid = opts.sides.roundId;
      fl = opts.sides.flip;

      for (var team of teams) {
        var ballot = team.rounds[rid].ballot;

        if (ballot != null && ballot.teams[1] != null) {
          team.stats.side = (ballot.teams[1] === team) ^ fl;
        }
      }
    }

    if (opts.algorithm === 0) {
      teams = _.shuffle(teams);
    }

    var restrictions = {
      conditions: [],

      match: function(t, looper) {
        var v = this.conditions;
        var nv = v.length;
        var min = new Array(nv);
        var score = new Array(nv);

        for (var [ii, e] of v.entries()) {
          min[ii] = Number.MAX_VALUE;
        }

        var r = null;

        looper(function(u) {
          var aux;

          if (u.stats.paired) {
            return;
          }

          if (u === t) {
            return;
          }

          var cmp = 0;
          var zero = true;

          for (var [k, cond] of v.entries()) {
            score[k] = cond(t, u);

            if (score[k]) {
              zero = false;
            }

            if (cmp === 0) {
              if (score[k] < min[k]) {
                cmp = 1;
              } else if (score[k] > min[k]) {
                cmp = 2;
              }
            }
          }

          if (cmp === 1) {
            aux = min;
            min = score;
            score = aux;
            r = u;
          }

          return zero;
        });

        return r;
      }
    };

    restrictions.conditions.push(function() {
      return 1;
    });

    if (opts.hardSides) {
      restrictions.conditions.push(function(a, b) {
        return (a.stats.side != null && b.stats.side != null && a.stats.side === b.stats.side ? 1 : 0);
      });
    }

    if (opts.minimizeReMeet) {
      restrictions.conditions.push(function(a, b) {
        var count = 0;

        for (var round of prevRounds) {
          ballot = a.rounds[round.id].ballot;

          if (ballot != null && ((ballot.teams[0] === a && ballot.teams[1] === b) || (ballot.teams[1] === a && ballot.teams[0] === b))) {
            count++;
          }
        }

        return count;
      });
    }

    if (opts.noClubMatches && (opts.algorithm === 0 || opts.algorithm === 2 || opts.algorithm === 3)) {
      restrictions.conditions.push(function(a, b) {
        return (a.club != null && b.club != null && a.club === b.club ? 1 : 0);
      });
    }

    var skillIndex = 0;
    var n = teams.length;

    switch (opts.algorithm) {
    case 1:
      for (var o of opts.manualPairing) {
        pairTeams(o.prop, o.opp);
      }

      break;
    case 0:
    case 2:
      for (var [i, t] of teams.entries()) {
        if (t.stats.paired) {
          continue;
        }

        var m = restrictions.match(t, function(test) {
          return (() => {
            for (var j of (function() {
              var ref1;
              var results1 = [];

              for (var j = ref1 = i + 1; (ref1 <= n ? j < n : j > n); (ref1 <= n ? j++ : j--)) {
                  results1.push(j);
              }

              return results1;
            }).apply(this)) {
              if (test(teams[j])) {
                return;
              }
            }
          })();
        });

        pairTeams(t, m, skillIndex++);
      }

      break;
    case 3:
      brackets = {};
      vb = [];

      for (var [i, t] of teams.entries()) {
        t.stats.rank = i;
        var nbal = t.stats.wins;
        bracket = brackets[nbal];

        if (!(bracket != null)) {
          bracket = brackets[nbal] = {
            teams: [],
            ballots: nbal
          };

          vb.push(bracket);
        }

        bracket.teams.push(t);
      }

      if (opts.evenBrackets === 1) {
        for (var t of teams) {
          var avgc = 0;
          t.stats.oppRank = 0;

          for (var rnd of prevRounds) {
            var bal = t.rounds[rnd.id].ballot;

            if (bal != null) {
              ta = bal.teams[0];
              tb = bal.teams[1];

              if (ta === t && tb != null && tb.stats != null && tb.stats.rank != null) {
                avgc++;
                t.stats.oppRank += tb.stats.rank;
              } else if (tb === t && ta != null && ta.stats != null && ta.stats.rank != null) {
                avgc++;
                t.stats.oppRank += ta.stats.rank;
              }
            }
          }

          if (avgc) {
            t.stats.oppRank /= avgc;
          } else {
            t.stats.oppRank = Number.MAX_VALUE;
          }
        }
      }

      switch (opts.evenBrackets) {
      case 0:
        pull = function(bracket, count, avoidedSide) {
          bracket.teams.sort(function(a, b) {
            return b.stats.rank - a.stats.rank;
          });

          return bracket.teams = _.filter(bracket.teams, function(a) {
            if (count > 0 && (!(typeof avoidedSide !== "undefined" && avoidedSide !== null) || avoidedSide === a.stats.side)) {
              count--;
              nextBracket.teams.push(a);
              return false;
            }

            return true;
          });
        };

        break;
      case 1:
        pull = function(bracket, count, avoidedSide) {
          var cni = i + 1;
          var _nextBracket = vb[cni];

          return (() => {
            while (count && cni < vbn) {
              var nbv = _nextBracket.teams;

              nbv.sort(function(a, b) {
                return b.stats.oppRank - a.stats.oppRank;
              });

              _nextBracket.teams = nbv = _.filter(nbv, function(a) {
                if (count > 0 && (!(typeof avoidedSide !== "undefined" && avoidedSide !== null) || avoidedSide !== a.stats.side)) {
                  count--;
                  bracket.teams.push(a);
                  return false;
                }

                return true;
              });

              _nextBracket = vb[++cni];
            }
          })();
        };
      }

      vb.sort(function(a, b) {
        return b.ballots - a.ballots;
      });

      vbn = vb.length;

      for (var [i, bracket] of vb.entries()) {
        var bo = bp = bu = 0;
        var bn = bracket.teams.length;

        if (!bn) {
          continue;
        }

        for (var t of bracket.teams) {
          switch (t.stats.side) {
          case 0:
            bp++;
            break;
          case 1:
            bo++;
            break;
          case undefined:
            bu++;
          }
        }

        var nextBracket = vb[i + 1];

        if (nextBracket != null) {
          if (opts.hardSides) {
            if (bo > bp + bu) {
              pull(bracket, bo - bp - bu, 1);
            } else if (bp > bo + bu) {
              pull(bracket, bp - bo - bu, 0);
            } else if (bn & 1) {
              pull(bracket, 1);
            }
          } else if (bn & 1) {
            pull(bracket, 1);
          }

          j = i + 1;

          while (nextBracket != null && nextBracket.length === 0) {
            nextBracket = vb[++j];
          }

          if (nextBracket != null) {
            bn = bracket.teams.length;
            nbv = nextBracket.teams;

            if (bn < opts.matchesPerBracket * 2) {
              bracket.teams.forEach(function(o) {
                return nbv.push(o);
              });

              bracket.teams.length = 0;
            }
          }
        }

        bracket.teams.sort(function(a, b) {
          return a.stats.rank - b.stats.rank;
        });

        for (var t of bracket.teams) {
          if (t.stats.paired) {
            continue;
          }

          m = restrictions.match(t, function(test) {
            return (() => {
              for (var tt of bracket.teams) {
                if (test(tt)) {
                  return;
                }
              }
            })();
          });

          pairTeams(t, m, skillIndex++);
        }
      }
    }

    if (bye != null) {
      pairTeams(bye, null, skillIndex);
    }

    this.paired = true;
    this.assignRooms();

    if (opts.shuffleRooms && opts.algorithm) {
      this.shuffleRooms();
    }

    return this.assignJudges();
  }

  assignJudges() {
    var split;
    var id = this.id;

    var ballots = _.sortBy((_.shuffle((_.filter(this.ballots, (function(o) {
      return !o.locked && o.teams[0] && o.teams[1];
    }))))), function(o) {
      return o.skillIndex;
    });

    for (var b of ballots) {
      for (var j of b.judges) {
        j.rounds[id].ballot = null;
      }

      for (var j of b.shadows) {
        j.rounds[id].ballot = null;
      }

      b.judges = [];
      b.shadows = [];
    }

    var judges = _.shuffle(_.filter(this.judges, function(o) {
      var ropts = o.rounds[id];
      return ropts.participates && !ropts.ballot && o.rank !== Judge.shadowRank;
    }));

    var shadowJudges = _.shuffle(_.filter(this.judges, function(o) {
      var ropts = o.rounds[id];
      return ropts.participates && !ropts.ballot && o.rank === Judge.shadowRank;
    }));

    var freeJ = this.freeJudges = [];
    var participationScores = {};

    _.each(judges, function(judge) {
      var sum = 0;

      _.each(this.rounds, function(round) {
        var ref;
        var ropts = judge.rounds[round.id];

        if (ropts && ropts.participates && ropts.ballot && ropts.ballot.locked) {
          return sum += (ref = ropts.shadow) != null ? ref : {
            1: 2
          };
        }
      });

      return participationScores[judge.id] = sum;
    });

    judges.sort(function(a, b) {
      var cmp = a.rank - b.rank;

      if (cmp !== 0) {
        return cmp;
      }

      var psa = participationScores[a.id];
      var psb = participationScores[b.id];
      return psa - psb;
    });

    var noBallots = ballots.length;
    var noJudges = judges.length;

    if (noJudges < noBallots) {
      split = noBallots - noJudges;

      if (shadowJudges.length < split) {
        split = shadowJudges.length;
      }

      for (var i of (function() {
          var results = [];

          for (var i = 0; (0 <= split ? i < split : i > split); (0 <= split ? i++ : i--)) {
              results.push(i);
          }

          return results;
      }).apply(this)) {
        judges.push(shadowJudges[i]);
      }

      shadowJudges.splice(0, split);
    }

    var ballotPerMatch = this.ballotsPerMatchSolved();
    var panelSize = this.maxPanelSizeSolved();
    var maxShadows = this.maxShadowJudgesSolved();
    var maxJudges = this.maxMainJudgesSolved();

    var addJudge = function(j, b, sh = false) {
      if (sh) {
        b.shadows.push(j);
      } else {
        b.judges.push(j);
      }

      var ropts = j.rounds[id];
      ropts.ballot = b;
      return ropts.shadow = sh;
    };

    var compat = function(judge, ballot) {
      return 0;
    };

    var rules = this.judgeRules;
    var mainRules = this.tournament.judgeRules;

    var assign = function(judges, order, priority, shadow, judgeCount) {
      var n;

      for (var b of ballots) {
        b.maxJudgeCount = judgeCount(b);
        b.judgeCount = 0;
      }

      var saturated = 0;
      var left = n = judges.length;

      while (left && saturated !== noBallots) {
        saturated = 0;

        for (var b of ballots) {
          if (b.maxJudgeCount <= b.judgeCount) {
            saturated++;
          } else {
            b.judgeCount++;
            left--;
          }

          if (!left) {
            break;
          }
        }
      }

      var filled = 1;

      return (() => {
        var score;

        while (filled) {
          filled = 0;

          for (var b of ballots) {
            if (b.judgeCount <= 0) {
              continue;
            }

            var judge = null;
            var min = Number.MAX_VALUE;

            for (var j of judges) {
              if (!(j.rounds[id].ballot != null)) {
                score = rules.compatibilityFactor(j, b, mainRules);

                if (score < min) {
                  min = score;
                  judge = j;

                  if (!score) {
                    break;
                  }
                }
              }
            }

            addJudge(judge, b, shadow);
            b.judgeCount--;
            filled++;
          }
        }
      })();
    };

    var mainsPerMatch = ballotPerMatch;

    if (panelSize < mainsPerMatch) {
      mainsPerMatch = panelSize;
    }

    if (maxJudges < mainsPerMatch) {
      mainsPerMatch = maxJudges;
    }

    assign(
      judges,
      this.judgeMainOrderSolved(),
      this.judgeMainPrioritySolved(),
      false,
      () => mainsPerMatch
    );

    judges.forEach(function(o) {
      if (!(o.rounds[id].ballot != null)) {
        return freeJ.push(o);
      }
    });

    var report = this.judgeShadowReportSolved();

    assign(
      report ? freeJ.concat(shadowJudges) : shadowJudges
      this.judgeShadowOrderSolved(),
      this.judgeShadowPrioritySolved(),
      true,
      ballot => {
        const ps = panelSize - ballot.judges.length;
        return (maxShadows < ps ? maxShadows : ps);
      }
    );

    if (report) {
      freeJ.length = 0;

      judges.forEach(function(o) {
        if (!(o.rounds[id].ballot != null)) {
          return freeJ.push(o);
        }
      });
    }

    shadowJudges.forEach(function(o) {
      if (!(o.rounds[id].ballot != null)) {
        return freeJ.push(o);
      }
    });

    return (() => {
      for (var b of ballots) {
        delete b.maxJudgeCount;
        delete b.judgeCount;
      }
    })();
  }

  assignRooms() {
    var ballots = _.filter(this.ballots, function(o) {
      return !o.locked;
    });

    var rooms = [];

    for (var ballot of ballots) {
      if (ballot.room != null) {
        rooms.push(ballot.room);
      }
    }

    for (var room of this.freeRooms) {
      rooms.push(room);
    }

    var n = rooms.length;
    var id = this.id;

    for (var [i, ballot] of ballots.entries()) {
      if (i >= n) {
        break;
      }

      room = rooms[i];
      room.rounds[id].ballot = ballot;
      ballot.room = room;
    }

    rooms.splice(0, ballots.length);
    return this.freeRooms = rooms;
  }

  shuffleRooms() {
    var id = this.id;

    var lockedBallots = _.filter(this.ballots, function(o) {
      return o.locked;
    });

    var ballots = _.filter(this.ballots, function(o) {
      return !o.locked;
    });

    var rooms = _.map(ballots, function(o) {
      return o.room;
    });

    ballots = _.shuffle(ballots);
    var i = 0;

    return (() => {
      for (var [j, bal] of this.ballots.entries()) {
        if (bal.locked) {
          continue;
        }

        var ballot = ballots[i];
        var room = rooms[i];

        if (room != null) {
          room.rounds[id].ballot = ballot;
        }

        ballot.room = room;
        this.ballots[j] = ballot;
        i++;
      }
    })();
  }

  shuffle() {
    var locked = [];
    var unlocked = [];

    for (var b of this.ballots) {
      if (b.teams[0] != null && b.teams[1] != null) {
        unlocked.push(b);
      } else {
        locked.push(b);
      }
    }

    unlocked = _.shuffle(unlocked);

    for (var [i, b] of unlocked.entries()) {
      this.ballots[i] = b;
    }

    var n = unlocked.length;

    return (() => {
      for (var [i, b] of locked.entries()) {
        this.ballots[i + n] = b;
      }
    })();
  }

  toJSON() {
    var model = Util.copyObject(this, ["tournament"]);
    model.teams = Util.packCycles(this.teams, this.tournament.teams);
    model.judges = Util.packCycles(this.judges, this.tournament.judges);
    model.freeJudges = Util.packCycles(this.freeJudges, this.tournament.judges);
    model.rooms = Util.packCycles(this.rooms, this.tournament.rooms);
    model.freeRooms = Util.packCycles(this.freeRooms, this.tournament.rooms);

    model.rankFrom = {
      all: this.rankFrom.all
    };

    for (var r of this.tournament.rounds) {
      var v = this.rankFrom[r.id];

      if (v != null) {
        model.rankFrom[id] = v;
      }
    }

    return model;
  }

  destroy() {
    var id = this.id;

    for (var team of this.tournament.teams) {
      delete team.rounds[id];
    }

    for (var judge of this.tournament.judges) {
      delete judge.rounds[id];
    }

    return (() => {
      for (var room of this.tournament.rooms) {
        delete room.rounds[id];
      }
    })();
  }

  static allAlgos = [0, 1, 2, 3];
  static initialAlgos = [0, 1];
  static algoName = ["Random", "Manual", "High-High Power Pairing", "High-Low Power Pairing"];
}

module.exports = Round;
