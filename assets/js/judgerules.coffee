define ['judge', 'team', 'club'], (Judge, Team, Club) ->
  class JudgeRules
    @newCriteria: (judge, verb, team) ->
      return {
        judge: judge
        verb: verb
        team: team
        toJSON: ->
          this
      }

    unpackCriterion: (criterion) ->
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
      ]

    addNewRule: ->
      @criteria.unshift JudgeRules.newCriteria 0, 1, 1

    removeRule: (index) ->
      @criteria.splice index, 1
