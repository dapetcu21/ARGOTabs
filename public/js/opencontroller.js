(function() {
  define(['jquery', 'filereader', 'alertcontroller', 'tournament', 'backends', 'localbackend', 'templates', 'jquery.transit'], function($, FileReaderJS, AlertController, Tournament, Backends, LocalBackend) {
    var OpenController;
    return OpenController = (function() {
      function OpenController(uiController) {
        var backend, openModal, _i, _len,
          _this = this;
        this.uiController = uiController;
        this.closeable = this.uiController.getTournament() != null;
        new AlertController({
          title: "Open tournament file",
          id: "open-modal",
          closeable: this.closeable,
          animated: this.closeable,
          buttons: this.closeable ? ["Cancel"] : [],
          primaryButtonIndex: -1,
          cancelButtonIndex: 0,
          width: 350,
          htmlMessage: templates.openModal()
        });
        this.openModal = openModal = $('#open-modal');
        openModal.find('#omodal-add-a1').click(function() {
          return openModal.find('.omodal-add-div').transition({
            x: '-33.33%'
          });
        });
        openModal.find('.omodal-btn-close').click(function() {
          return _this.resetAdd();
        });
        openModal.find('#omodal-btn-new').click(function() {
          var controlGroup, newNode, textBox;
          newNode = $('#omodal-add-page3').html(templates.openModalAddLocal);
          newNode.find('.omodal-btn-close').click(function() {
            return _this.resetAdd();
          });
          textBox = newNode.find('.omodal-text');
          textBox.keypress(function(e) {
            var newName;
            if (e.which === 13 && !textBox[0].readOnly) {
              newName = textBox[0].value;
              if (_this.filenameAvailable(newName, backend)) {
                textBox[0].readOnly = true;
                _this.newItem(newName, LocalBackend);
                _this.resetAdd();
                return false;
              }
            }
            return true;
          });
          controlGroup = textBox.parent();
          textBox.bind('input propertychange', function() {
            var newName;
            newName = textBox[0].value;
            if (_this.filenameAvailable(newName, LocalBackend)) {
              return controlGroup.removeClass('error');
            } else {
              return controlGroup.addClass('error');
            }
          });
          return openModal.find('.omodal-add-div').transition({
            x: '-66.66%'
          }, function() {
            return textBox.focus();
          });
        });
        this.fileLists = {};
        for (_i = 0, _len = Backends.length; _i < _len; _i++) {
          backend = Backends[_i];
          backend.listFiles(function(fileNames) {
            var name, _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = fileNames.length; _j < _len1; _j++) {
              name = fileNames[_j];
              _results.push(_this.addItem(name, backend));
            }
            return _results;
          });
        }
        openModal.find('#omodal-btn-upload').click(function() {
          return openModal.find('.omodal-file').click();
        });
        openModal.fileReaderJS(this.prepareFileReader());
        openModal.find('.omodal-file').fileReaderJS(this.prepareFileReader());
      }

      OpenController.prototype.resetAdd = function() {
        var div,
          _this = this;
        div = this.openModal.find('.omodal-add-div');
        return div.transition({
          x: 0
        }, function() {
          return div.find('#omodal-add-page3').html("");
        });
      };

      OpenController.prototype.addItem = function(itemName, backend) {
        var animDiv, controlGroup, fl, item, itemNode, textBox, validateEntry,
          _this = this;
        item = {
          name: itemName,
          backend: backend
        };
        fl = this.fileLists[backend];
        if (fl == null) {
          fl = this.fileLists[backend] = {};
        }
        fl[itemName] = true;
        itemNode = this.openModal.find("#open-modal-add-tr").before(templates.openModalAddItem(item));
        itemNode = itemNode.prev();
        animDiv = itemNode.find('.omodal-edit-div');
        textBox = itemNode.find('.omodal-text');
        controlGroup = textBox.parent();
        textBox.keypress(function(e) {
          var be, newName;
          if (e.which === 13 && !textBox[0].readOnly) {
            newName = textBox[0].value;
            if (textBox[0].ongoingDeletion) {
              if (newName === "confirm deletion of file") {
                new backend(itemName)["delete"]();
                delete fl[itemName];
                itemNode.remove();
                textBox[0].readOnly = true;
                animDiv.transition({
                  x: 0
                });
                return false;
              }
            } else {
              if (newName === itemName) {
                textBox[0].readOnly = true;
                animDiv.transition({
                  x: 0
                });
                return false;
              }
              if (_this.filenameAvailable(newName, backend)) {
                be = new backend(itemName);
                be.rename(newName);
                textBox[0].readOnly = true;
                delete fl[itemName];
                fl[newName] = true;
                itemNode.find('.omodal-label').html(newName);
                itemName = newName;
                animDiv.transition({
                  x: 0
                });
                return false;
              }
            }
          }
          return true;
        });
        textBox.bind('input propertychange', validateEntry = function() {
          var newName, ongoingDeletion, valid;
          newName = textBox[0].value;
          ongoingDeletion = textBox[0].ongoingDeletion;
          valid = ongoingDeletion ? newName === "confirm deletion of file" : newName === itemName || _this.filenameAvailable(newName, backend);
          if (valid) {
            controlGroup.removeClass('error');
            if (ongoingDeletion) {
              return controlGroup.addClass('success');
            } else {
              return controlGroup.removeClass('success');
            }
          } else {
            controlGroup.removeClass('success');
            return controlGroup.addClass('error');
          }
        });
        itemNode.find('.omodal-btn-close').click(function() {
          textBox[0].readOnly = true;
          return animDiv.transition({
            x: 0
          });
        });
        itemNode.find('.omodal-btn-edit').click(function() {
          textBox[0].placeholder = 'Type the new file name';
          textBox[0].value = itemName;
          textBox[0].readOnly = false;
          textBox[0].ongoingDeletion = false;
          validateEntry();
          return animDiv.transition({
            x: '-50%'
          }, function() {
            return textBox.focus();
          });
        });
        itemNode.find('.omodal-btn-delete').click(function() {
          textBox[0].placeholder = 'Type "confirm deletion of file"';
          textBox[0].value = '';
          textBox[0].readOnly = false;
          textBox[0].ongoingDeletion = true;
          validateEntry();
          return animDiv.transition({
            x: '-50%'
          }, function() {
            return textBox.focus();
          });
        });
        return itemNode.find('.omodal-a').click(function() {
          var to;
          to = new Tournament(new backend(itemName));
          _this.openModal.modal('hide');
          return _this.uiController.setTournament(to);
        });
      };

      OpenController.prototype.newItem = function(item, backend) {
        var be,
          _this = this;
        be = new backend(item);
        return be.save(JSON.stringify({
          name: item
        }), function() {
          return _this.addItem(item, backend);
        });
      };

      OpenController.prototype.filenameAvailable = function(fileName, backend) {
        var fl;
        if (fileName === "") {
          return false;
        }
        fl = this.fileLists[backend];
        if (fl == null) {
          return true;
        }
        return !fl[fileName];
      };

      OpenController.prototype.prepareFileReader = function() {
        var _this = this;
        return {
          dragClass: "dropbox",
          readAsDefault: "Text",
          readAsMap: {},
          on: {
            beforestart: function(file) {
              return (file.name.match(/\.atab$/)) != null;
            },
            loadend: function(e, file) {
              var be, name;
              name = (file.name.match(/^(.*?)(\.atab)?$/))[1];
              while (!_this.filenameAvailable(name, LocalBackend)) {
                name = name + ' (2)';
              }
              be = new LocalBackend(name);
              return be.save(e.target.result, function() {
                return _this.addItem(name, LocalBackend);
              });
            },
            groupend: function() {
              return _this.resetAdd();
            }
          }
        };
      };

      return OpenController;

    })();
  });

}).call(this);
