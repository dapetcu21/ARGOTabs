define ['lodash'], (_) ->
  newCrit = (name, crit, operand = '>', equality = '==') ->
    funcString = '(function(a,b) { 
      if (a.'+crit+operand+'b.'+crit+') return -1;
      if (a.'+crit+equality+'b.'+crit+') return 0;
      return 1;
    })'
    funcString = funcString.replace /[ ][ ]+/g, ''
    return {
      name: name
      id: crit
      func: eval funcString
      toJSON: -> {name:this.name, func:funcString, id: this.id}
    }
      
  class Sorter
    constructor: (criteria = []) ->
      if criteria.criteria?
        criteria = criteria.criteria
      @criteria = criteria
      for criterion in criteria
        if not typeof criterion.id?
          criterion.id = Sorter.legacyNames[criterion.name]

        if typeof criterion.func == 'string'
          criterion.funcString = criterion.func
          criterion.func = eval criterion.func
          criterion.toJSON =  -> {name:this.name, func:this.funcString, id: this.id}

    compareObjects: (a,b) ->
      return true if not @criteria?
      for criterion in @criteria
        r = criterion.func a,b
        return -1 if r < 0
        return 1 if r > 0
      return 0

    boundComparator: -> @compareObjects.bind this

    @sorterFromBlueprint: (o, blueprint) ->
      if not o?
        return new Sorter blueprint

      if o.criteria?
        o = o.criteria

      visited = {}

      _.each o, (crit) ->
        visited[crit.id or Sorter.legacyNames[crit.name]] = true

      _.each blueprint, (crit) ->
        if not visited[crit.id]
          o.push crit

      return new Sorter o

    @teamRankSorter: (o) ->
      Sorter.sorterFromBlueprint o, [
        newCrit('Ballots', 'ballots'),
        newCrit('Score', 'score'),
        newCrit('H/L Score', 'scoreHighLow'),
        newCrit('Win Margin', 'margin'),
        newCrit('Wins', 'wins')
        newCrit('Reply Score', 'reply')
      ]

    @speakerRankSorter: (o) ->
      Sorter.sorterFromBlueprint o, [
        newCrit('Score', 'score'),
        newCrit('H/L Score', 'scoreHighLow'),
        newCrit('Reply Score', 'reply')
      ]

    @legacyNames:
      'Ballots': 'ballots'
      'Score': 'score'
      'H/L Score': 'scoreHighLow'
      'Wins': 'wins'
      'Reply Score': 'reply'

