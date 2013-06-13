(function() {
  define(['jquery', 'opencontroller', 'alertcontroller', 'localbackend', 'B64', 'jquery.bootstrap'], function($, OpenController, AlertController, LocalBackend, B64) {
    var UIController;
    return UIController = (function() {
      function UIController() {
        var _this = this;
        $(document).ready(function() {
          _this.open();
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
          return $('.action-saveaslocal').click(function() {
            return _this.saveaslocal();
          });
        });
      }

      UIController.prototype.open = function() {
        var _this = this;
        return this.save(function() {
          return new OpenController(_this);
        });
      };

      UIController.prototype.save = function(fn) {
        if (this.tournament) {
          return this.tournament.save(fn);
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
          onClick: function(alert, index) {
            var be, data, e, newName;
            if (index === 1) {
              newName = alert.find('.saveas-text')[0].value;
              if (!invalid[newName]) {
                try {
                  be = new LocalBackend(newName);
                  data = _this.tournament.toFile;
                  return be.save(data, function() {
                    return alert.modal('hide');
                  });
                } catch (_error) {
                  e = _error;
                  return console.log(e.message);
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
        if (this.tournament) {
          return this.tournament.load(function() {
            var name;
            name = _this.tournament.name;
            return $('.view-title').html('ARGO Tabs' + (name ? ' - ' + name : ''));
          });
        } else {
          return $('.view-title').html('ARGO Tabs');
        }
      };

      return UIController;

    })();
  });

}).call(this);
