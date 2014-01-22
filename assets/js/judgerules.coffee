define ['util', 'judge', 'team', 'club'], (Util, Judge, Team, Club) ->
  class JudgeRules
    newCriteria: (judge, verb, team) ->
      return {
        judge: judge
        verb: verb
        team: team
        toJSON: @criterionPackFn()
      }

    criterionPackFn: ->
      trn = @tournament
      ->
        r =
          verb: @verb

        if @judge == null
          r.judge = r.judgeType = -1
        if typeof @judge == 'number'
          r.judge = @judge
          r.judgeType = 0
        else if @judge instanceof Judge
          r.judge = Util.packCycle @judge, trn.judges
          r.judgeType = 1
        else if @judge instanceof Club
          r.judge = Util.packCycle @judge, trn.clubs
          r.judgeType = 2

        if @team == null
          r.team = r.teamType = -1
        if typeof @team == 'number'
          r.team = @team
          r.teamType = 0
        else if @team instanceof Team
          r.team = Util.packCycle @team, trn.teams
          r.teamType = 1
        else if @team instanceof Club
          r.team = Util.packCycle @team, trn.clubs
          r.teamType = 2

        return r

    unpackCriterion: (c) ->
      trn = @tournament
      if c.judgeType == -1
        c.judge = null
      else if c.judgeType == 1
        c.judge = Util.unpackCycle c.judge, trn.judges
      else if c.judgeType == 2
        c.judge = Util.unpackCycle c.judge, trn.clubs
      delete c.judgeType

      if c.teamType == -1
        c.team = null
      else if c.teamType == 1
        c.team = Util.unpackCycle c.team, trn.teams
      else if c.teamType == 2
        c.team = Util.unpackCycle c.team, trn.clubs
      delete c.teamType

      c.toJSON = @criterionPackFn()
      return

    @judgeLabel: (judge) ->
      if judge == 0
        return "All judges"
      if judge == 1
        return "Unaffiliated judges"
      if judge instanceof Club
        return "Judges from " + judge.name
      if judge instanceof Judge
        return judge.name
      return "!!ERROR!!"

    @teamLabel: (team) ->
      if team == 0
        return "any team"
      if team == 1
        return "teams from their club"
      if team == 2
        return "when both teams are from their club"
      if team instanceof Club
        return "teams from " + team.name
      if team instanceof Team
        return team.name
      return "!!ERROR!!"

    @verbLabel = ["can judge", "can't judge"]
    @verbResult = [true, false]

    judgeArray: ->
      [0, 1].concat @tournament.clubs, @tournament.judges

    teamArray: ->
      [0, 1, 2].concat @tournament.clubs, @tournament.teams

    constructor: (@tournament, criteria = []) ->
      if criteria.criteria?
        criteria = criteria.criteria
      @criteria = criteria
      for criterion in criteria
        @unpackCriterion criterion

    evalCriterion: (crit, judge, ballot) ->
      #true - the rule specifically states this combo is allowed
      #false - the rule specifically states this combo is disallowed
      #2 - the rule does not refer to this combo
      ta = ballot.teams[0]
      tb = ballot.teams[1]
      return 2 if not ta? or not tb? or not judge?
      return 2 if not crit.team? or not crit.judge?
      return 2 if crit.judge == 1 and judge.club?
      return 2 if crit.judge instanceof Club and judge.club != crit.judge
      return 2 if crit.judge instanceof Judge and judge != crit.judge

      vrb = if crit.verb == 0 then true else false

      relevantTeam = (t) ->
        return true if crit.team == 0
        return true if crit.team == 1 and judge.club? and judge.club == t.club
        return true if crit.team == 2 and judge.club? and ta.club == tb.club and ta.club == judge.club
        return true if crit.team instanceof Club and t.club == crit.team
        return true if crit.team instanceof Team and t == crit.team
        return false

      return vrb if crit.team == 2 and judge.club? and ta.club == tb.club and ta.club == judge.club
      return vrb if relevantTeam(ta) or relevantTeam(tb)
      return 2
    
    isCompatible: (judge, ballot, next) ->
      for criterion in @criteria
        e = @evalCriterion criterion, judge, ballot
        if (e == true) or (e == false)
          return e
      if next?
        return next.isCompatible judge, ballot, null
      return true

    compatibilityFactor: (judge, ballot, next) ->
      fact = 0
      for criterion in @criteria
        e = @evalCriterion criterion, judge, ballot
        if (e == false)
          fact++
        if (e == true)
          return fact
      if next?
        return fact + next.compatibilityFactor judge, ballot, null
      return fact

    toJSON: ->
      criteria: @criteria

    @mainRules: (tournament, o) ->
      return new JudgeRules tournament, if o? then o else [
        {judge:0, verb:0, team:2}, #all judges can judge club matches
        {judge:0, verb:1, team:1}  #all judges can't judge their club
      ]

    addNewRule: ->
      @criteria.unshift @newCriteria 0, 0, 0

    removeRule: (index) ->
      @criteria.splice index, 1

    entityDestroyed: (e) ->
      return if not e?
      for criterion in @criteria
        if criterion.judge == e
          criterion.judge = null
        if criterion.team == e
          criterion.team = null
