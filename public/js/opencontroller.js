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
          var newNode, textBox;
          newNode = $('#omodal-add-page3').html(templates.openModalAddLocal);
          newNode.find('.omodal-btn-close').click(function() {
            return _this.resetAdd();
          });
          textBox = newNode.find('.omodal-text');
          textBox.keypress(function(e) {
            if (e.which === 13 && !textBox[0].readOnly) {
              textBox[0].readOnly = true;
              _this.newItem(textBox[0].value, LocalBackend);
              _this.resetAdd();
              return false;
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
            console.log(fileNames);
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

      OpenController.prototype.addItem = function(item, backend) {
        var itemNode;
        return itemNode = this.openModal.find("#open-modal-add-tr").before(templates.openModalAddItem({
          item: item,
          backend: backend
        }));
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

      return OpenController;

    })();
  });

}).call(this);
