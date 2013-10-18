define [], ->
  newCrit = (name, crit, operand = '>', equality = '==') ->
    funcString = '(function(a,b) { 
      if (a.'+crit+operand+'b.'+crit+') return -1;
      if (a.'+crit+equality+'b.'+crit+') return 0;
      return 1;
    })'
    return {
      name: name
      func: eval funcString
      toJSON: -> {name:this.name, func: funcString}
    }
      
  class Sorter
    constructor: (criteria = []) ->
      if criteria.criteria?
        criteria = criteria.criteria
      @criteria = criteria
      for criterion in criteria
        if typeof criterion.func == 'string'
          criterion.func = eval criterion.func

    compareObjects: (a,b) ->
      return true if not @criteria?
      for criterion in @criteria
        r = criterion.func a,b
        return true if r < 0
        return false if r > 0
      return true

    @teamRankSorter: (o) ->
      new Sorter if o? then o else [
        newCrit('Ballots', 'ballots'),
        newCrit('Points', 'score'),
        newCrit('H/L Points', 'scoreHighLow'),
        newCrit('Wins', 'wins')
      ]





