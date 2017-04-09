var Backend = require('./backend')
var Util = require('../core/util')
var Club = require('./club')
var Team = require('./team')
var Judge = require('./judge')
var Room = require('./room')
var Player = require('./player')
var Round = require('./round')
var Sorter = require('./sorter')
var JudgeRules = require('./judgerules')
var UUID = require('./uuid')

class Tournament {
  constructor (source) {
    this.source = source
    this.id = UUID('tournament_')
    this.clubs = []
    this.teams = []
    this.judges = []
    this.rooms = []
    this.players = []
    this.rounds = []
    this.tableOpts = {}
    this.ballotsPerMatch = 1
    this.evenBrackets = 0
    this.matchesPerBracket = 1
    this.maxMainJudges = 10000
    this.maxShadowJudges = 10000
    this.maxPanelSize = 10000
    this.judgeMainPriority = 0
    this.judgeMainOrder = 0
    this.judgeShadowPriority = 0
    this.judgeShadowOrder = 0
    this.judgeShadowReport = false
    this.minPlayed = 1;
    (this.allowShadows != null ? this.allowShadows : this.allowShadows = true);

    (this.rankFromTeams != null ? this.rankFromTeams : this.rankFromTeams = {
      all: true
    });

    (this.rankFromSpeakers != null ? this.rankFromSpeakers : this.rankFromSpeakers = {
      all: true
    })

    this.loaded = false
    this.minConstructiveScore = 60
    this.maxConstructiveScore = 80
    this.minReplyScore = 30
    this.maxReplyScore = 40
  }

  load (fn, fnErr = function () {}) {
    return this.source.load((model => {
      try {
        if (typeof (model) === 'string') {
          model = JSON.parse(model)
        }

        this.loadFromModel(model)
      } catch (err) {
        fnErr(err)
        return
      }

      fn()
      return
    }), fnErr)
  }

  loadFromModel (model) {
    (model != null ? model : model = {})

    for (var [key, value] of Object.entries(model)) {
      this[key] = value
    }

    for (var [i, club] of this.clubs.entries()) {
      this.clubs[i] = new Club(this, club)
    }

    for (var [i, team] of this.teams.entries()) {
      this.teams[i] = new Team(this, team)
    }

    for (var [i, judge] of this.judges.entries()) {
      this.judges[i] = new Judge(this, judge)
    }

    for (var [i, room] of this.rooms.entries()) {
      this.rooms[i] = new Room(this, room)
    }

    for (var [i, player] of this.players.entries()) {
      this.players[i] = new Player(this, player)
    }

    for (var [i, round] of this.rounds.entries()) {
      this.rounds[i] = new Round(this, round)
    }

    for (var club of this.clubs) {
      club.unpackCycles()
    }

    for (var team of this.teams) {
      team.unpackCycles()
    }

    for (var judge of this.judges) {
      judge.unpackCycles()
    }

    for (var room of this.rooms) {
      room.unpackCycles()
    }

    for (var player of this.players) {
      player.unpackCycles()
    }

    for (var round of this.rounds) {
      round.unpackCycles()
    }

    this.speakerRankSorter = Sorter.speakerRankSorter(model.speakerRankSorter)
    this.teamRankSorter = Sorter.teamRankSorter(model.teamRankSorter)
    this.pairRankSorter = Sorter.teamRankSorter(model.pairRankSorter)
    this.judgeRules = JudgeRules.mainRules(this, model.judgeRules)
    // this.lastData = this.toFile()
    return this.loaded = true
  }

  roundWithId (id) {
    for (var round of this.rounds) {
      if ('' + round.id === '' + id) {
        return round
      }
    }

    return null
  }

  toJSON () {
    var model = Util.copyObject(this, ['source', 'lastData', 'loaded'])

    model.rankFromTeams = {
      all: this.rankFromTeams.all
    }

    for (var r of this.rounds) {
      var v = this.rankFromTeams[r.id]

      if (v != null) {
        model.rankFromTeams[r.id] = v
      }
    }

    return model
  }

  toFile (pretty = false) {
    if (pretty) {
      return JSON.stringify(this, null, 2)
    } else {
      return JSON.stringify(this)
    }
  }

  save (fn, force = false) {
    return this.saveData(this.toFile(), fn, force)
  }

  saveIfRequired (fn, force = false) {
    var data = this.toFile()

    if (this.lastData === data) {
      return false
    }

    this.saveData(data, fn, force)
    return true
  }

  saveData (data, fn, force = false) {
    if (!this.loaded) {
      return
    }

    return this.source.save(data, () => {
      this.lastData = data
      return fn()
    }, force)
  }

  clubWithName (s) {
    for (var c of this.clubs) {
      if (c.name === s) {
        return c
      }
    }

    return null
  }

  censor (ext) {
    if (ext) {
      ext.censor(this)
    }

    _.each(this.judges, function (judge) {
      return judge.rank = Judge.censoredRank
    })

    this.judges = _.shuffle(this.judges)
    this.judgeRules = JudgeRules.mainRules(this)

    return _.each(this.rounds, function (round) {
      return round.censor()
    })
  }

  addClub (s) {
    var club = new Club(this)
    this.clubs.push(club)
    club.name = s
    return club
  }

  addTeam (name, clubName, members) {
    let club = null
    if (clubName) {
      club = this.clubWithName(clubName)
      if (!club) { club = this.addClub(clubName) }
    }

    const team = new Team(this)
    team.name = name
    if (club) {
      team.club = club
      club.addTeam(team)
    }

    for (let m of members) {
      var p = team.addPlayer()
      p.name = m
    }

    this.teams.push(team)
    return team
  }

  addJudge (name, clubName, rank = 0) {
    let club = null
    if (clubName) {
      club = this.clubWithName(clubName)
      if (!club) { club = this.addClub(clubName) }
    }

    if (rank === -1) {
      rank = Judge.shadowRank
    }

    var judge = new Judge(this)
    judge.name = name
    judge.rank = rank
    if (club) {
      judge.club = club
      club.addJudge(judge)
    }
    this.judges.push(judge)
    return judge
  }

  destroyEntityInJudgeRules (e) {
    this.judgeRules.entityDestroyed(e)
    for (var r of this.rounds) {
      r.judgeRules.entityDestroyed(e)
    }
  }
}

Tournament.placeholderTournament = new Tournament(Backend.load('placeholder://localhost/Placeholder Tournament.atab'))
Tournament.placeholderTournament.load(() => {})

module.exports = Tournament
