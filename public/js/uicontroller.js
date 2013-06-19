(function() {
  define(['jquery', 'B64', 'cookies', 'opencontroller', 'alertcontroller', 'tournament', 'backends', 'localbackend', 'routes/routes', 'util', 'components', 'angular'], function($, B64, Cookies, OpenController, AlertController, Tournament, Backends, LocalBackend, Routes, Util) {
    var UIController;
    return UIController = (function() {
      function UIController() {
        var app,
          _this = this;
        this.app = app = angular.module('argotabs', ['components']);
        app.controller('LoadingCtrl', [
          '$scope', function($scope) {
            return $scope.loaded = true;
          }
        ]);
        Routes(this);
        this.injector = angular.bootstrap(document, ['argotabs']);
        $(document).ready(function() {
          _this.loadSession(function() {
            return new OpenController(_this);
          });
          $(".fixed-menu").mouseover(function() {
            var newPos, oldPos, submenuPos, windowPos;
            submenuPos = $(this).offset().left + 325;
            windowPos = $(window).width();
            oldPos = $(this).offset().left + $(this).width();
            newPos = $(this).offset().left - $(this).width();
            return $(this).find('ul').offset({
              "left": submenuPos > windowPos ? newPos : oldPos
            });
          });
          $('.action-open').click(function() {
            return _this.open();
          });
          $('.action-download').click(function() {
            return _this.download();
          });
          $('.action-saveaslocal').click(function() {
            return _this.saveaslocal();
          });
          return $('.action-save').click(function() {
            return _this.save();
          });
        });
        this.autosaveStopped = 0;
        setInterval(function() {
          if (!_this.autosaveStopped) {
            return _this.save((function() {}), true);
          }
        }, 5000);
      }

      UIController.prototype.open = function() {
        var _this = this;
        return this.save(function() {
          return new OpenController(_this);
        });
      };

      UIController.prototype.loadSession = function(onFail) {
        var backend, e, found, lastBackend, lastFileName, _i, _len,
          _this = this;
        lastBackend = Cookies.get('lastBackend');
        lastFileName = Cookies.get('lastFileName');
        found = false;
        if (lastBackend && lastFileName) {
          for (_i = 0, _len = Backends.length; _i < _len; _i++) {
            backend = Backends[_i];
            if (Util.getClass(backend) === lastBackend) {
              try {
                backend.listFiles(function(fileList) {
                  if (fileList.indexOf(lastFileName) !== -1) {
                    _this.setTournament(new Tournament(new backend(lastFileName)));
                    return found = true;
                  }
                });
              } catch (_error) {
                e = _error;
                console.log(e.message);
              }
              break;
            }
          }
        }
        if (!found) {
          return onFail();
        }
      };

      UIController.prototype.save = function(fn, autosave) {
        var btn, btns, callback, e,
          _this = this;
        if (autosave == null) {
          autosave = false;
        }
        if (fn == null) {
          fn = function() {};
        }
        if (this.tournament) {
          btn = $('.action-save');
          btns = $('.view-save');
          btn.button('loading');
          clearTimeout(this._saveTimer);
          this.autosaveStopped++;
          try {
            callback = function() {
              _this.autosaveStopped--;
              btn.button('saved');
              btns.addClass('btn-success');
              btns.removeClass('btn-info');
              _this._saveTimer = setTimeout(function() {
                btn.button('reset');
                btns.addClass('btn-info');
                return btns.removeClass('btn-success');
              }, 1000);
              return fn();
            };
            if (autosave) {
              if (!this.tournament.saveIfRequired(callback)) {
                this.autosaveStopped--;
                return btn.button('reset');
              }
            } else {
              return this.tournament.save(callback);
            }
          } catch (_error) {
            e = _error;
            return new AlertController({
              title: "Saving error",
              message: e.message,
              buttons: e.canForce ? [e.canForce, 'OK'] : ['OK'],
              cancelButtonIndex: e.canForce ? 1 : 0,
              onClick: function(alert, idx) {
                var button, text;
                if (e.canForce && idx === 0) {
                  button = alert.find('.modal-footer').children().first();
                  button[0].dataset.loading - (text = "Saving...");
                  button.button('loading');
                  try {
                    return _this.tournament.save((function() {
                      alert.modal('hide');
                      return fn();
                    }), true);
                  } catch (_error) {
                    e = _error;
                    if (e.canForce) {
                      button.show();
                      button.html(e.canForce);
                    } else {
                      button.hide();
                    }
                    button.button('reset');
                    return alert.find('.modal-body').html('<p>' + e.message + '</p>');
                  }
                }
              },
              onDismissed: function() {
                btn.button('reset');
                return _this.autosaveStopped--;
              }
            });
          }
        } else {
          return fn();
        }
      };

      UIController.prototype.download = function() {
        var data, link;
        if (!this.tournament) {
          return;
        }
        data = B64.encode(this.tournament.toFile());
        $('body').append('<a id="downloader" download="' + this.tournament.name + '.atab" href="data:application/octet-stream;base64,' + data + '"></a>');
        link = $('#downloader');
        link[0].click();
        return link.remove();
      };

      UIController.prototype.saveaslocal = function() {
        var invalid,
          _this = this;
        invalid = {};
        LocalBackend.listFiles(function(fileList) {
          var file, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = fileList.length; _i < _len; _i++) {
            file = fileList[_i];
            _results.push(invalid[file] = true);
          }
          return _results;
        });
        return new AlertController({
          title: "Save as",
          htmlMessage: templates.saveAs({
            value: this.tournament.backend.fileName() + " (2)"
          }),
          buttons: ['Cancel', 'Save'],
          cancelButtonIndex: 0,
          width: 400,
          onShow: function(alert) {
            var controlGroup, textBox;
            textBox = alert.find('.saveas-text');
            controlGroup = alert.find('.saveas-control-group');
            textBox.bind('input propertychange', function() {
              var newName;
              newName = textBox[0].value;
              if (invalid[newName]) {
                return controlGroup.addClass('error');
              } else {
                return controlGroup.removeClass('error');
              }
            });
            if (invalid[textBox[0].value]) {
              controlGroup.addClass('error');
            }
            return textBox.keypress(function(e) {
              if (e.which === 13) {
                return alert.find('.btn-primary').click();
              }
            });
          },
          onShown: function(alert) {
            var textBox;
            textBox = alert.find('.saveas-text');
            return textBox.focus();
          },
          onClick: function(alert, index, buttonName, force) {
            var be, btnDanger, data, e, newName, text, thisFunction;
            if (force == null) {
              force = false;
            }
            if (index === 1) {
              thisFunction = arguments.callee;
              newName = alert.find('.saveas-text')[0].value;
              if (!invalid[newName]) {
                if (!force) {
                  alert.find('.btn-primary').button('loading');
                }
                try {
                  be = new LocalBackend(newName);
                  data = _this.tournament.toFile;
                  return be.save(data, (function() {
                    return alert.modal('hide');
                  }), force);
                } catch (_error) {
                  e = _error;
                  alert.find('.btn-primary').button('reset');
                  alert.find('.saveas-error').remove();
                  alert.find('.modal-body').append(templates.alert({
                    classes: 'saveas-error alert-error' + (e.canForce ? ' alert-block' : void 0),
                    title: "Error while saving file:",
                    message: e.message,
                    button: e.canForce,
                    buttonClass: "btn-danger"
                  }));
                  if (e.canForce) {
                    btnDanger = alert.find('.btn-danger');
                    btnDanger[0].dataset.loading - (text = "Saving...");
                    return btnDanger.click(function() {
                      btnDanger.button('loading');
                      return thisFunction(alert, index, null, true);
                    });
                  }
                }
              }
            }
          }
        });
      };

      UIController.prototype.getTournament = function() {
        return this.tournament;
      };

      UIController.prototype.setTournament = function(tournament) {
        var _this = this;
        this.tournament = tournament;
        if (tournament) {
          return tournament.load(function() {
            Cookies.set('lastBackend', Util.getObjectClass(tournament.backend));
            Cookies.set('lastFileName', tournament.backend.fileName());
            return _this.injector.invoke([
              '$rootScope', function($rootScope) {
                return $rootScope.$apply(function() {
                  return $rootScope.tournament = tournament;
                });
              }
            ]);
          });
        } else {
          Cookies.expire('lastBackend');
          Cookies.expire('lastFileName');
          return this.injector.invoke([
            '$rootScope', function($rootScope) {
              return $rootScope.$apply(function() {
                return $rootScope.tournament = nil;
              });
            }
          ]);
        }
      };

      return UIController;

    })();
  });

}).call(this);
