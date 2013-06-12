(function() {
  define(['jquery', 'tournament', 'backends', 'localbackend', 'templates', 'jquery.transit'], function($, Tournament, backends, LocalBackend) {
    var OpenController, getObjectClass;
    getObjectClass = function(obj) {
      var arr;
      if (obj && obj.constructor && obj.constructor.toString) {
        arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length === 2) {
          return arr[1];
        }
      }
      return void 0;
    };
    return OpenController = (function() {
      function OpenController(uiController) {
        var backend, openModal, _i, _len,
          _this = this;
        this.uiController = uiController;
        this.closeable = this.uiController.getTournament() != null;
        $('body').append(templates.openModal({
          closeable: this.closeable
        }));
        this.openModal = openModal = $('#open-modal');
        openModal.modal(this.closeable ? null : {
          keyboard: false,
          backdrop: 'static'
        });
        openModal.css({
          'width': '300px',
          'margin-left': function() {
            return -$(this).width() / 2;
          }
        });
        openModal.on('hidden', function() {
          return openModal.remove();
        });
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
          textBox.focus();
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
            console.log("plm ");
            if (_this.filenameAvailable(newName, LocalBackend)) {
              return controlGroup.removeClass('error');
            } else {
              return controlGroup.addClass('error');
            }
          });
          return openModal.find('.omodal-add-div').transition({
            x: '-66.66%'
          });
        });
        this.fileLists = {};
        for (_i = 0, _len = backends.length; _i < _len; _i++) {
          backend = backends[_i];
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
              if (newName === "confirm") {
                new backend(itemName)["delete"]();
                fl[itemName] = false;
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
                fl[itemName] = false;
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
          valid = ongoingDeletion ? newName === "confirm" : newName === itemName || _this.filenameAvailable(newName, backend);
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
          textBox.focus();
          validateEntry();
          return animDiv.transition({
            x: "-50%"
          });
        });
        return itemNode.find('.omodal-btn-delete').click(function() {
          textBox[0].placeholder = 'Type "confirm" to delete';
          textBox[0].value = '';
          textBox[0].readOnly = false;
          textBox[0].ongoingDeletion = true;
          textBox.focus();
          validateEntry();
          return animDiv.transition({
            x: "-50%"
          });
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

      return OpenController;

    })();
  });

}).call(this);
