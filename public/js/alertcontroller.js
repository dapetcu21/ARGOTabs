(function() {
  define(['jquery'], function($) {
    var AlertController;
    return AlertController = (function() {
      function AlertController(opts) {
        var jq, mbody, o;
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
        if (o.cssClass == null) {
          o.cssClass = "";
        }
        if (o.animated == null) {
          o.animated = true;
        }
        if (o.id == null) {
          o.id = 'modalid' + Math.round(Math.random() * 10000);
        }
        if (o.animated) {
          o.cssClass = 'fade ' + o.cssClass;
        }
        jq = $(templates.modal({
          o: o
        }));
        jq.find('.modal-title').append(o.title);
        mbody = jq.find('.modal-body');
        if (o.message) {
          mbody.append('<p>' + o.message + '</p>');
        }
        if (o.htmlMessage) {
          mbody.append(o.htmlMessage);
        }
        $('body').append(jq);
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
