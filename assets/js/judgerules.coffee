define [], ->
  class JudgeRules
    constructor: (@tournament, criteria = []) ->
      if criteria.criteria?
        criteria = criteria.criteria
      @criteria = criteria
      #for criterion in criteria
      #  unfold criterion
    
    isCompatible: (judge, ballot, next) ->
      true

    compatibilityFactor: (judge, ballot, next) ->
      fact = 0
      if judge.club?
        if ballot.teams[0]? and ballot.teams[0].club == judge.club
          fact++
        if ballot.teams[1]? and ballot.teams[1].club == judge.club
          fact++
      fact

    errorMessage: (judge, ballot, next) ->
      judge.name + " is allowed to judge this match"

    toJSON: ->
      criteria: @criteria

    @mainRules: (tournament, o) ->
      return new JudgeRules tournament, if o? then o else [
      ]
