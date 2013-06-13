(function() {
  define(['jquery'], function($) {
    var AlertController;
    return AlertController = (function() {
      function AlertController(opts) {
        var contents, id, jq, o;
        this.opts = opts;
        if (this.opts == null) {
          this.opts = {};
        }
        o = this.opts;
        if (o.buttons == null) {
          o.buttons = [];
        }
        if (o.cancelButtonIndex == null) {
          o.cancelButtonIndex = -1;
        }
        if (o.primaryButtonIndex == null) {
          o.primaryButtonIndex = o.buttons.length - 1;
        }
        if (o.title == null) {
          o.title = "Alert";
        }
        if (o.closeable == null) {
          o.closeable = true;
        }
        contents = "";
        if (o.message) {
          contents += '<p>' + o.message + '</p>';
        }
        if (o.htmlMessage) {
          contents += o.htmlMessage;
        }
        id = 'modal' + (Math.round(Math.random() * 100000));
        $('body').append(templates.modal({
          o: o,
          contents: contents,
          id: id
        }));
        jq = $('#' + id);
        if (o.width) {
          jq.css({
            'width': o.width,
            'margin-left': function() {
              return -$(this).width() / 2;
            }
          });
        }
        jq.find('.modal-button').click(function() {
          var button, buttonName;
          button = parseInt(this.dataset.count);
          buttonName = o.buttons[button];
          if (o.onClick) {
            return o.onClick(jq, button, buttonName);
          }
        });
        jq.find('.modal-cancel').click(function() {
          if (o.onCancel) {
            o.onCancel(jq);
          }
          return jq.modal('hide');
        });
        jq.on('hidden', function() {
          jq.remove();
          if (o.onDismissed) {
            return o.onDismissed(jq);
          }
        });
        jq.on('hide', function() {
          if (o.onDismiss) {
            return o.onDismiss(jq);
          }
        });
        jq.on('shown', function() {
          if (o.onShown) {
            return o.onShown(jq);
          }
        });
        jq.on('show', function() {
          if (o.onShow) {
            return o.onShow(jq);
          }
        });
        jq.modal(o.closeable ? null : {
          keyboard: false,
          backdrop: 'static'
        });
      }

      return AlertController;

    })();
  });

}).call(this);
