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
      #ARGO A - Central
      #WSDC - Central Banat
      #ARGO-Central - Central
      fact = 0
      teamCompat = (team) ->
        return true if not team?
        return false if team.club == judge.club
        return false if team.name == "ARGO A" and judge.club.name == "Central"
        return false if team.name == "WSDC" and judge.club.name == "Central"
        return false if team.name == "WSDC" and judge.club.name == "Banat"
        return false if team.name == "ARGO-Central" and judge.club.name == "Central"
        return true
        
      if judge.club?
        fact++ if not teamCompat ballot.teams[0]
        fact++ if not teamCompat ballot.teams[1]
      fact

    errorMessage: (judge, ballot, next) ->
      judge.name + " is allowed to judge this match"

    toJSON: ->
      criteria: @criteria

    @mainRules: (tournament, o) ->
      return new JudgeRules tournament, if o? then o else [
      ]
