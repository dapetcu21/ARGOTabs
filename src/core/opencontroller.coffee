define [
  './alertcontroller',
  '../models/tournament',
  '../models/backend',
  './templates',
  'filereader',
  'jquery',
  'jquery.transit'
], (AlertController, Tournament, Backend, templates) ->
  LocalBackend = Backend.backendForSchema('local')

  class OpenController
    constructor: (@uiController, onReady = (->), onDismiss = (->)) ->
      @closeable = @uiController.getTournament()?

      @alertController = new AlertController
        title: "Open tournament file"
        id: "open-modal"
        closeable: @closeable
        animated: @closeable
        buttons: if @closeable then ["Cancel"] else []
        primaryButtonIndex: -1
        cancelButtonIndex: 0
        width: 350
        height: if @closeable then 310 else 250
        htmlMessage: templates.openModal()
        onShown: ->
          discl = $ templates.disclaimer()
          discl.appendTo $('.modal-backdrop')
          if @closeable
            setTimeout ->
              discl.addClass 'in'
            , 0
            discl.find('a').click (e) ->
              e.preventDefault()
              window.location = e.currentTarget.href
              return false
          else
            discl.addClass 'in'
        onShow: onReady
        onDismiss: onDismiss

      @openModal = openModal = $('#open-modal')


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
            newName = textBox[0].value
            source = LocalBackend.load(LocalBackend.urlFromFileName(newName))
            if !source.exists()
              textBox[0].readOnly = true
              @newItem source
              @resetAdd()
              return false
          return true

        controlGroup = textBox.parent()
        textBox.bind 'input propertychange', =>
          newName = textBox[0].value
          source = LocalBackend.load(LocalBackend.urlFromFileName(newName))
          if !source.exists()
            controlGroup.removeClass 'error'
          else
            controlGroup.addClass 'error'

        openModal.find('.omodal-add-div').transition {x: '-66.66%'}, ->
          textBox.focus()

      Backend.list @addItem.bind(@)

      openModal.find('#omodal-btn-upload').click =>
        openModal.find('.omodal-file').click()
      
      openModal.fileReaderJS @prepareFileReader()
      openModal.find('.omodal-file').fileReaderJS @prepareFileReader()

    resetAdd: ->
      div = @openModal.find('.omodal-add-div')
      div.transition {x : 0}, =>
        div.find('#omodal-add-page3').html ""

    addItem: (source) ->
      item =
        name: source.fileName(),
        icon: source.backend.icon() or '<i class="fa fa-fw fa-question"></i>'

      itemNode = $(templates.openModalAddItem item)
      itemNode.insertBefore @openModal.find("#open-modal-add-tr")

      animDiv = itemNode.find('.omodal-edit-div')
      textBox = itemNode.find('.omodal-text')
      controlGroup = textBox.parent()

      textBox.keypress (e) =>
        if e.which == 13 and not textBox[0].readOnly
          newName = textBox[0].value
          if textBox[0].ongoingDeletion
            if newName == "confirm deletion of file"
              if @uiController.tournament? and source.url() == @uiController.tournament.source.url()
                @uiController.setTournament null
                btn = $('#open-modal .modal-footer .modal-cancel')
                btn.addClass 'disabled'
                btn.css 'pointer-events', 'none'
                $('#open-modal .modal-header .modal-cancel').remove()
              source.delete()
              itemNode.remove()

              textBox[0].readOnly = true
              animDiv.transition
                x: 0
              return false
          else
            if newName == item.name
              textBox[0].readOnly = true
              animDiv.transition
                x: 0
              return false
            if source.canRename newName
              source.rename(newName)
              textBox[0].readOnly = true
              itemNode.find('.omodal-label').html(newName)
              item.name = newName
              animDiv.transition
                x: 0
              return false
        return true

      textBox.bind 'input propertychange', validateEntry = =>
        newName = textBox[0].value
        ongoingDeletion = textBox[0].ongoingDeletion
        valid = if ongoingDeletion
          newName == "confirm deletion of file"
        else
          newName == item.name or source.canRename(newName)

        if valid
          controlGroup.removeClass 'error'
          if ongoingDeletion
            controlGroup.addClass 'success'
          else
            controlGroup.removeClass 'success'
        else
          controlGroup.removeClass 'success'
          controlGroup.addClass 'error'


      itemNode.find('.omodal-btn-close').click =>
        textBox[0].readOnly = true
        animDiv.transition
          x: 0

      itemNode.find('.omodal-btn-edit').click =>
        textBox[0].placeholder = 'Type the new file name'
        textBox[0].value = item.name
        textBox[0].readOnly = false
        textBox[0].ongoingDeletion = false
        validateEntry()
        animDiv.transition {x: '-50%'}, ->
          textBox.focus()

      itemNode.find('.omodal-btn-delete').click =>
        textBox[0].placeholder = 'Type "confirm deletion of file"'
        textBox[0].value = ''
        textBox[0].readOnly = false
        textBox[0].ongoingDeletion = true
        validateEntry()
        animDiv.transition {x: '-50%'}, ->
          textBox.focus()

      itemNode.find('.omodal-a').click =>
        to = new Tournament(source)
        @openModal.modal 'hide'
        @uiController.setTournament to

    newItem: (source) ->
      source.save (JSON.stringify
        name: source.fileName()), =>
        @addItem source

    prepareFileReader: ->
      dragClass: "dropbox"
      readAsDefault: "Text"
      readAsMap: {}
      on:
        beforestart: (file) ->
          return (file.name.match /\.atab$/)?
        loadend: (e, file) =>
          name = (file.name.match /^(.*?)(\.atab)?$/)[1]
          while (source = LocalBackend.load(LocalBackend.urlFromFileName(name))) and source.exists()
            name = name + ' (2)'
          source.save e.target.result, =>
            @addItem source
        groupend: =>
          @resetAdd()

