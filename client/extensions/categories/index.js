class TournamentCategory {
  sidebarCategory() {
    return {
      name: "Tournament",
      sortToken: 1
    };
  }
}

class ParticipantsCategory {
  sidebarCategory() {
    return {
      name: "Participants",
      sortToken: 2
    };
  }
}

class StatisticsCategory {
  sidebarCategory() {
    return {
      name: "Statistics",
      sortToken: 3
    };
  }
}

class RoundsCategory {
  sidebarCategory() {
    return {
      name: "Rounds",
      sortToken: 4
    };
  }
}

module.exports = [
  TournamentCategory,
  ParticipantsCategory,
  StatisticsCategory,
  RoundsCategory
];
