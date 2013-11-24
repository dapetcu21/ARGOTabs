define [], ->
  newCrit = (name, crit, operand = '>', equality = '==') ->
    funcString = '(function(a,b) { 
      if (a.'+crit+operand+'b.'+crit+') return -1;
      if (a.'+crit+equality+'b.'+crit+') return 0;
      return 1;
    })'
    funcString = funcString.replace /[ ][ ]+/g, ''
    return {
      name: name
      func: eval funcString
      toJSON: -> {name:this.name, func:funcString}
    }
      
  class Sorter
    constructor: (criteria = []) ->
      if criteria.criteria?
        criteria = criteria.criteria
      @criteria = criteria
      for criterion in criteria
        if typeof criterion.func == 'string'
          criterion.funcString = criterion.func
          criterion.func = eval criterion.func
          criterion.toJSON =  -> {name:this.name, func:this.funcString}

    compareObjects: (a,b) ->
      return true if not @criteria?
      for criterion in @criteria
        r = criterion.func a,b
        return -1 if r < 0
        return 1 if r > 0
      return 0

    boundComparator: -> @compareObjects.bind this

    @teamRankSorter: (o) ->
      new Sorter if o? then o else [
      #new Sorter [
        newCrit('Ballots', 'ballots'),
        newCrit('Score', 'score'),
        newCrit('H/L Score', 'scoreHighLow'),
        newCrit('Wins', 'wins')
        newCrit('Reply Score', 'reply')
      ]

    @speakerRankSorter: (o) ->
      new Sorter if o? then o else [
      #new Sorter [
        newCrit('H/L Score', 'scoreHighLow'),
        newCrit('Score', 'score'),
        newCrit('Reply Score', 'reply')
      ]





