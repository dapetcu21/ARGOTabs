define ['jquery', 'tournament', 'backends', 'localbackend', 'templates', 'jquery.transit'], ($, Tournament, backends, LocalBackend) ->
  getObjectClass = (obj) ->
    if obj and obj.constructor and obj.constructor.toString
      arr = obj.constructor.toString().match /function\s*(\w+)/
      if arr and arr.length == 2
        return arr[1]
    undefined

  class OpenController
    constructor: (@uiController) ->
      @closeable = @uiController.getTournament()?


      $('body').append templates.openModal
        closeable: @closeable

      @openModal = openModal = $('#open-modal')
      openModal.modal if @closeable then null else
        keyboard: false
        backdrop: 'static'

      openModal.css
        'width': '300px'
        'margin-left': ->
          -$(this).width() / 2

      openModal.on 'hidden', ->
        openModal.remove()

      openModal.find('#omodal-add-a1').click =>
        openModal.find('.omodal-add-div').transition
          x: '-33.33%'

      openModal.find('.omodal-btn-close').click =>
        @resetAdd()

      openModal.find('#omodal-btn-new').click =>
        newNode = $('#omodal-add-page3').html templates.openModalAddLocal
        newNode.find('.omodal-btn-close').click =>
          @resetAdd()

        textBox = newNode.find('.omodal-text')
        textBox.keypress (e) =>
          if e.which == 13 and not textBox[0].readOnly
            textBox[0].readOnly = true
            @newItem textBox[0].value, LocalBackend
            @resetAdd()
            return false

        openModal.find('.omodal-add-div').transition
          x: '-66.66%'

      @fileLists = {}
      for backend in backends
        backend.listFiles (fileNames) =>
          console.log fileNames
          for name in fileNames
            @addItem name, backend

    resetAdd: ->
      div = @openModal.find('.omodal-add-div')
      div.transition {x : 0}, =>
        div.find('#omodal-add-page3').html ""

    addItem: (item, backend) ->
      @openModal.find("#open-modal-add-tr").before templates.openModalAddItem
        item: item

    newItem: (item, backend) ->
      be = new backend(item)
      be.save (JSON.stringify
        name: item), =>
        @addItem item, backend
      
