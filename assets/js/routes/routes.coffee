define ['routes/unimplemented', 'routes/json', 'routes/clubs', 'routes/dashboard', 'routes/teams', 'routes/judges', 'routes/rooms', 'routes/rounds', 'routes/team-rank', 'routes/speaker-rank'], (Unimplemented, Json, Clubs, Dashboard, Teams, Judges, Rooms, Rounds, TeamRank, SpeakerRank) ->
  (ui) ->
    ui.app.config ['$routeProvider', ($routeProvider) ->
      Unimplemented ui, $routeProvider
      Clubs ui, $routeProvider
      Dashboard ui, $routeProvider
      Teams ui, $routeProvider
      Judges ui, $routeProvider
      Rooms ui, $routeProvider
      Rounds ui, $routeProvider
      TeamRank ui, $routeProvider
      SpeakerRank ui, $routeProvider
      Json ui, $routeProvider

      $routeProvider.otherwise
        redirectTo: '/unimplemented'
    ]
        

