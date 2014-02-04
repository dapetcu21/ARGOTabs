define ['routes/unimplemented', 'routes/json', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms', 'routes/rounds', 'routes/team-rank', 'routes/speaker-rank'], (Unimplemented, Json, Clubs, Dashboard, Teams, Judges, Rooms, Rounds, TeamRank, SpeakerRank) ->
  v = [Unimplemented, Json, Clubs, Dashboard, Teams, Judges, Rooms, Rounds, TeamRank, SpeakerRank]
  (ui) ->
    for o in v
      if typeof o == 'object'
        o[0](ui)
    ui.app.config ['$routeProvider', ($routeProvider) ->
      for o in v
        if typeof o == 'object'
          o[1](ui, $routeProvider)
        else
          o(ui, $routeProvider)

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

