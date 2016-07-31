var B64 = require("B64");
var Cookies = require("cookies");
var OpenController = require("./opencontroller");
var AlertController = require("./alertcontroller");
var Extensions = require("./extensions");
var Tournament = require("../models/tournament");
var Backend = require("../models/backend");
var JSONSource = require("../models/backends/jsonsource");
var Util = require("./util");
var $ = require("jquery");
var templateSaveAs = require("./templates/saveAs.jade");
var templateAlert = require("./templates/alert.jade");
var LocalBackend = Backend.backendForSchema("local");

class UIController {
  constructor() {
    var app;
    this.extensions = new Extensions(this);
    this.app = app = angular.module("argotabs", this.extensions.angularModules());

    app.controller("LoadingCtrl", ["$scope", $scope => {
      return $scope.loaded = true;
    }]);

    $(document).ready(() => {
      this.extensions.setUpRoutes();
      this.extensions.setUpSidebar();
      this.previousRoute = window.location.href;
      history.replaceState(null, "", "/#/loading");
      this.injector = angular.bootstrap(document, ["argotabs"]);

      this.loadSession(() => {
        this.setTournament(null);

        return this.open(() => {
          return this.rootApply(function(scope) {
            return scope.tournamentLoaded = true;
          });
        });
      });

      $(".fixed-menu").mouseover(function() {
        var submenuPos = $(this).offset().left + 325;
        var windowPos = $(window).width();
        var oldPos = $(this).offset().left + $(this).width();
        var newPos = $(this).offset().left - $(this).width();

        return $(this).find("ul").offset({
          "left": (submenuPos > windowPos ? newPos : oldPos)
        });
      });

      $(".action-open").click(() => {
        return this.open();
      });

      $(".action-download").click(() => {
        return this.download();
      });

      $(".action-download-censored").click(() => {
        return this.downloadCensored();
      });

      $(".action-saveaslocal").click(() => {
        return this.saveaslocal();
      });

      return $(".action-save").click(() => {
        return this.save();
      });
    });

    this.autosaveStopped = 0;

    setInterval(() => {
      if (!this.autosaveStopped) {
        return this.save((function() {}), true);
      }
    }, 5000);
  }

  rootApply(fn) {
    this.injector.invoke(["$rootScope", function($rootScope) {
      return $rootScope.$apply(fn($rootScope));
    }]);

    return;
  }

  open(fn = function() {}) {
    return this.save(() => {
      return this.openController = new OpenController(this, (() => {
        this.saveSession(null);
        return fn();
      }), (() => {
        this.saveSession(this.tournament);
        return this.openController = null;
      }));
    });
  }

  saveSession(tournament) {
    if (typeof tournament !== "undefined" && tournament !== null) {
      return Cookies.set("ARGOTabs_lastURL", tournament.source.url());
    } else {
      return Cookies.expire("ARGOTabs_lastURL");
    }
  }

  loadSession(onFail = (function() {}), onOpen = (function() {})) {
    var source;
    var lastURL = Cookies.get("ARGOTabs_lastURL");
    var locationURL = this.previousRoute.match(/^[^#]*#\/url\/([^#]*)#?(.*)$/);

    if (locationURL) {
      lastURL = decodeURIComponent(locationURL[1]);
      this.previousRoute = "#" + locationURL[2];
    }

    this.previousRoute = "#" + this.previousRoute.replace(/^[^#]*#?/, "");

    try {
      if (lastURL) {
        source = Backend.load(lastURL);

        if (!source.exists()) {
          throw new Error("Entry for " + lastURL + "does not exist");
        }

        this.setTournament(new Tournament(source), () => {
          window.location.href = this.previousRoute;
          return onOpen();
        });
      } else {
        throw new Error("No session to resume");
      }
    } catch (e) {
      onFail();
      window.location.href = this.previousRoute;
    }

    return;
  }

  save(fn, autosave = false) {
    var btns;
    var btn;
    (fn != null ? fn : fn = function() {});

    if (this.tournament && this.tournament.source.canSave()) {
      btn = $(".action-save");
      btns = $(".view-save");
      btn.button("loading");
      clearTimeout(this._saveTimer);
      this.autosaveStopped++;

      try {
        var callback = () => {
          this.autosaveStopped--;
          btn.button("saved");
          btns.addClass("btn-success");
          btns.removeClass("btn-info");

          this._saveTimer = setTimeout(function() {
            btn.button("reset");
            btns.addClass("btn-info");
            return btns.removeClass("btn-success");
          }, 1000);

          return fn();
        };

        if (autosave) {
          if (!this.tournament.saveIfRequired(callback)) {
            this.autosaveStopped--;
            return btn.button("reset");
          }
        } else {
          return this.tournament.save(callback);
        }
      } catch (e) {
        return new AlertController({
          title: "Saving error",
          message: e.message,

          buttons: (() => {
            if (e.canForce) {
              return [e.canForce, "OK"];
            } else {
              return ["OK"];
            }
          })(),

          cancelButtonIndex: (e.canForce ? 1 : 0),

          onClick: (alert, idx) => {
            var text;
            var button;

            if ((e.canForce && idx === 0)) {
              button = alert.find(".modal-footer").children().first();
              button[0].dataset.loading - (text = "Saving...");
              button.button("loading");

              try {
                return this.tournament.save((function() {
                  alert.modal("hide");
                  return fn();
                }), true);
              } catch (e) {
                if (e.canForce) {
                  button.show();
                  button.html(e.canForce);
                } else {
                  button.hide();
                }

                button.button("reset");
                return alert.find(".modal-body").html("<p>" + e.message + "</p>");
              }
            }
          },

          onDismissed: () => {
            btn.button("reset");
            return this.autosaveStopped--;
          }
        });
      }
    } else {
      return fn();
    }
  }

  downloadName() {
    var date = new Date();

    return [
      this.tournament.name,
      [date.getFullYear(), date.getMonth(), date.getDay()].join("-"),
      [date.getHours(), date.getMinutes(), date.getSeconds()].join("-")
    ].join("_");
  }

  download() {
    if (!this.tournament) {
      return;
    }

    var data = B64.encode(this.tournament.toFile());

    $("body").append(
      "<a id=\"downloader\" download=\"" + this.downloadName() + ".atab\" href=\"data:application/octet-stream;base64," + data + "\"></a>"
    );

    var link = $("#downloader");
    link[0].click();
    return link.remove();
  }

  downloadCensored() {
    if (!this.tournament) {
      return;
    }

    var source = new JSONSource(this.tournament.toFile());
    var newTournament = new Tournament(source);

    return newTournament.load(() => {
      newTournament.censor(this.extensions);
      var data = B64.encode(newTournament.toFile());

      $("body").append(
        "<a id=\"downloader\" download=\"" + this.downloadName() + " (censored).atab\" href=\"data:application/octet-stream;base64," + data + "\"></a>"
      );

      var link = $("#downloader");
      link[0].click();
      return link.remove();
    });
  }

  saveaslocal() {
    return new AlertController({
      title: "Save as",

      htmlMessage: templateSaveAs({
        value: this.tournament.source.fileName() + " (2)"
      }),

      buttons: ["Cancel", "Save"],
      cancelButtonIndex: 0,
      width: 400,

      onShow: alert => {
        var textBox = alert.find(".saveas-text");
        var controlGroup = alert.find(".saveas-control-group");

        textBox.bind("input propertychange", () => {
          var newName = textBox[0].value;

          if (LocalBackend.load(LocalBackend.urlFromFileName(newName)).exists()) {
            return controlGroup.addClass("error");
          } else {
            return controlGroup.removeClass("error");
          }
        });

        if (LocalBackend.load(LocalBackend.urlFromFileName(textBox[0].value)).exists()) {
          controlGroup.addClass("error");
        }

        return textBox.keypress(e => {
          if (e.which === 14) {
            return alert.find(".btn-primary").click();
          }
        });
      },

      onShown: alert => {
        var textBox = alert.find(".saveas-text");
        return textBox.focus();
      },

      onClick: (alert, index, buttonName, force = false) => {
        var source;
        var newName;
        var thisFunction;

        if (index === 1) {
          thisFunction = arguments.callee;
          newName = alert.find(".saveas-text")[0].value;
          source = LocalBackend.load(LocalBackend.urlFromFileName(newName));

          if (!source.exists()) {
            if (!force) {
              alert.find(".btn-primary").button("loading");
            }

            try {
              var data = this.tournament.toFile();

              return source.save(data, (() => {
                return alert.modal("hide");
              }), force);
            } catch (e) {
              var text;
              var btnDanger;
              alert.find(".btn-primary").button("reset");
              alert.find(".saveas-error").remove();

              alert.find(".modal-body").append(templateAlert({
                classes: "saveas-error alert-error" + ((() => {
                  if (e.canForce) {
                    return " alert-block";
                  }
                })()),

                title: "Error while saving file:",
                message: e.message,
                button: e.canForce,
                buttonClass: "btn-danger"
              }));

              if (e.canForce) {
                btnDanger = alert.find(".btn-danger");
                btnDanger[0].dataset.loading - (text = "Saving...");

                return btnDanger.click(() => {
                  btnDanger.button("loading");
                  return thisFunction(alert, index, null, true);
                });
              }
            }
          }
        }
      }
    });
  }

  getTournament() {
    return this.tournament;
  }

  setTournament(tournament, cb = (function() {}), errcb = (function() {})) {
    this.tournament = tournament;

    if (tournament) {
      this.rootApply(function(sc) {
        return sc.loadingTournament = true;
      });

      return tournament.load((() => {
        this.saveSession(tournament);

        return this.rootApply(function(sc) {
          sc.tournament = tournament;
          sc.tournamentLoaded = true;
          sc.loadingTournament = false;
          return cb();
        });
      }), (err => {
        this.setTournament(null);
        console.log(err.stack);

        new AlertController({
          buttons: ["OK"],
          primaryButtonIndex: 0,
          closeable: false,
          animated: false,
          id: "open-tournament-error",
          height: 200,
          title: "Error",
          message: "Can't open tournament: " + err.message,

          onShow: () => {
            return this.rootApply(function(sc) {
              return sc.loadingTournament = false;
            });
          },

          onClick: (alert, bIndex, bName) => {
            if (bIndex === 0) {
              return this.open(function() {
                return alert.modal("hide");
              });
            }
          }
        });

        return errcb(err);
      }));
    } else {
      this.saveSession(null);

      return this.rootApply(function(sc) {
        return sc.tournament = Tournament.placeholderTournament;
      });
    }
  }
}

module.exports = UIController;