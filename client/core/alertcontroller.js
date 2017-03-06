var $ = require('jquery.bootstrap')
var templateModal = require('./templates/modal.jade')

class AlertController {
  constructor (opts = {}) {
    this.opts = opts

    opts.buttons = opts.buttons || []
    if (opts.cancelButtonIndex == null) { opts.cancelButtonIndex = -1 }
    if (opts.primaryButtonIndex == null) { opts.primaryButtonIndex = opts.buttons.length - 1 }
    opts.title = opts.title || 'Alert'
    if (opts.closeable == null) { opts.closeable = true }
    opts.cssClass = opts.cssClass || ''
    if (opts.animated == null) { opts.animated = true }
    opts.tabIndex = opts.tabIndex || []
    opts.id = opts.id || 'modalid' + Math.round(Math.random() * 10000)

    opts.cssClass = (opts.animated ? 'fade ' : 'modal-not-animated ') + opts.cssClass

    var jq = $(templateModal({ o: opts }))

    jq.find('.modal-title').append(opts.title)
    var mbody = jq.find('.modal-body')

    if (opts.message) {
      mbody.append('<p>' + opts.message + '</p>')
    }

    if (opts.htmlMessage) {
      mbody.append(opts.htmlMessage)
    }

    $('body').append(jq)
    var buttons = jq.find('.modal-footer a.btn')

    buttons.keypress(function (e) {
      if (e.which === 13 || e.which === 32) {
        return $(e.currentTarget).click()
      }
    })

    for (var v of opts.tabIndex) {
      if (v >= buttons.length) {
        continue
      }

      $(buttons[v]).attr('tabindex', 0)
    }

    jq.find('.modal-button').click(function () {
      var button = parseInt(this.dataset.count)
      var buttonName = opts.buttons[button]

      if (opts.onClick) {
        return opts.onClick(jq, button, buttonName)
      }
    })

    jq.find('.modal-cancel').click(function () {
      if (opts.onCancel) {
        opts.onCancel(jq)
      }

      return jq.modal('hide')
    })

    jq.on('hidden.bs.modal', function () {
      jq.remove()

      if (opts.onDismissed) {
        return opts.onDismissed(jq)
      }
    })

    jq.on('hide.bs.modal', function () {
      if (opts.onDismiss) {
        return opts.onDismiss(jq)
      }
    })

    jq.on('shown.bs.modal', function () {
      console.log('shown')
      if (opts.onShown) {
        return opts.onShown(jq)
      }
    })

    jq.on('show.bs.modal', function () {
      if (opts.onShow) {
        return opts.onShow(jq)
      }
    })

    const modalOpts = opts.closeable
      ? { show: true }
      : {
        keyboard: false,
        backdrop: 'static',
        show: true
      }

    jq.modal(modalOpts)
  }
}

module.exports = AlertController
