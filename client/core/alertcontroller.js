var $ = require('jquery.bootstrap')
var templateModal = require('./templates/modal.jade')

class AlertController {
  constructor (opts) {
    this.opts = opts || {}

    var o = this.opts
    o.buttons = o.buttons || [];
    (o.cancelButtonIndex != null ? o.cancelButtonIndex : o.cancelButtonIndex = -1);
    (o.primaryButtonIndex != null ? o.primaryButtonIndex : o.primaryButtonIndex = o.buttons.length - 1);
    (o.title != null ? o.title : o.title = 'Alert');
    (o.closeable != null ? o.closeable : o.closeable = true);
    (o.cssClass != null ? o.cssClass : o.cssClass = '');
    (o.animated != null ? o.animated : o.animated = true);
    (o.tabIndex != null ? o.tabIndex : o.tabIndex = []);
    (o.id != null ? o.id : o.id = 'modalid' + Math.round(Math.random() * 10000))

    if (o.animated) {
      o.cssClass = 'fade ' + o.cssClass
    }

    var jq = $(templateModal({ o: o }))

    jq.find('.modal-title').append(o.title)
    var mbody = jq.find('.modal-body')

    if (o.message) {
      mbody.append('<p>' + o.message + '</p>')
    }

    if (o.htmlMessage) {
      mbody.append(o.htmlMessage)
    }

    $('body').append(jq)
    var buttons = jq.find('.modal-footer a.btn')

    buttons.keypress(function (e) {
      if (e.which === 13 || e.which === 32) {
        return $(e.currentTarget).click()
      }
    })

    for (var v of o.tabIndex) {
      if (v >= buttons.length) {
        continue
      }

      $(buttons[v]).attr('tabindex', 0)
    }

    jq.find('.modal-button').click(function () {
      var button = parseInt(this.dataset.count)
      var buttonName = o.buttons[button]

      if (o.onClick) {
        return o.onClick(jq, button, buttonName)
      }
    })

    jq.find('.modal-cancel').click(function () {
      if (o.onCancel) {
        o.onCancel(jq)
      }

      return jq.modal('hide')
    })

    jq.on('hidden', function () {
      jq.remove()

      if (o.onDismissed) {
        return o.onDismissed(jq)
      }
    })

    jq.on('hide', function () {
      if (o.onDismiss) {
        return o.onDismiss(jq)
      }
    })

    jq.on('shown', function () {
      if (o.onShown) {
        return o.onShown(jq)
      }
    })

    jq.on('show', function () {
      if (o.onShow) {
        return o.onShow(jq)
      }
    })

    opts = (() => {
      if (o.closeable) {
        return {}
      } else {
        return {
          keyboard: false,
          backdrop: 'static'
        }
      }
    })()

    opts.show = true
    jq.modal(opts)
  }
}

module.exports = AlertController
