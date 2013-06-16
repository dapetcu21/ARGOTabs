define ['jquery'], ($) ->
  class AlertController
    constructor: (@opts) ->
      @opts ?= {}
      o = @opts
      o.buttons ?= []
      o.cancelButtonIndex ?= -1
      o.primaryButtonIndex ?= o.buttons.length - 1
      o.title ?= "Alert"
      o.closeable ?= true
      o.id ?= 'modal' + (Math.round Math.random() * 100000)
      o.cssClass ?= ""
      o.animated ?= true

      if o.animated
        o.cssClass = 'fade ' + o.cssClass

      contents = ""
      contents += '<p>'+o.message+'</p>' if o.message
      contents += o.htmlMessage if o.htmlMessage

      
      $('body').append templates.modal
        o: o
        contents: contents

      jq = $('#' + o.id)

      jq.find('.modal-button').click ->
        button = parseInt this.dataset.count
        buttonName = o.buttons[button]
        o.onClick jq, button, buttonName if o.onClick

      jq.find('.modal-cancel').click ->
        o.onCancel jq if o.onCancel
        jq.modal('hide')

      jq.on 'hidden', ->
        jq.remove()
        o.onDismissed jq if o.onDismissed

      jq.on 'hide', ->
        o.onDismiss jq if o.onDismiss

      jq.on 'shown', ->
        o.onShown jq if o.onShown

      jq.on 'show', ->
        o.onShow jq if o.onShow

      jq.modal if o.closeable then null else
        keyboard: false
        backdrop: 'static'

