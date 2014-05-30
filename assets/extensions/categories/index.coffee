define [], ->
  class TournamentCategory
    sidebarCategory: ->
      name: 'Tournament'
      sortToken: 1

  class ParticipantsCategory
    sidebarCategory: ->
      name: 'Participants'
      sortToken: 2


  class StatisticsCategory
    sidebarCategory: ->
      name: 'Statistics'
      sortToken: 3

  class RoundsCategory
    sidebarCategory: ->
      name: 'Rounds'
      sortToken: 4

  [TournamentCategory, ParticipantsCategory, StatisticsCategory, RoundsCategory]
