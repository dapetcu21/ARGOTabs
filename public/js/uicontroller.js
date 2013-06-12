(function() {
  define(['jquery', 'jquery.bootstrap', 'opencontroller'], function($, bs, OpenController) {
    var UIController;
    return UIController = (function() {
      function UIController() {
        var _this = this;
        $(document).ready(function() {
          return _this.open();
        });
      }

      UIController.prototype.open = function() {
        return new OpenController(this);
      };

      UIController.prototype.getTournament = function() {
        return this.tournament;
      };

      UIController.prototype.setTournament = function(tournament) {
        this.tournament = tournament;
      };

      return UIController;

    })();
  });

}).call(this);
