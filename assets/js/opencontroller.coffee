define ['jquery', 'filereader', 'alertcontroller', 'tournament', 'backends', 'localbackend', 'templates', 'jquery.transit'], ($, FileReaderJS, AlertController, Tournament, Backends, LocalBackend, templates) ->
  class OpenController
    constructor: (@uiController, onReady = (->), onDismiss = (->)) ->
      @closeable = @uiController.getTournament()?

      new AlertController
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
            if @filenameAvailable newName, backend
              textBox[0].readOnly = true
              @newItem newName, LocalBackend
              @resetAdd()
              return false
          return true

        controlGroup = textBox.parent()
        textBox.bind 'input propertychange', =>
          newName = textBox[0].value
          if @filenameAvailable newName, LocalBackend
            controlGroup.removeClass 'error'
          else
            controlGroup.addClass 'error'

        openModal.find('.omodal-add-div').transition {x: '-66.66%'}, ->
          textBox.focus()

      @fileLists = {}
      for backend in Backends
        backend.listFiles (fileNames) =>
          for name in fileNames
            @addItem name, backend

      openModal.find('#omodal-btn-upload').click =>
        openModal.find('.omodal-file').click()
      
      openModal.fileReaderJS @prepareFileReader()
      openModal.find('.omodal-file').fileReaderJS @prepareFileReader()

    resetAdd: ->
      div = @openModal.find('.omodal-add-div')
      div.transition {x : 0}, =>
        div.find('#omodal-add-page3').html ""

    addItem: (itemName, backend) ->
      item =
        name: itemName
        icon: backend.icon or '<i class="fa fa-fw fa-question"></i>'

      fl = @fileLists[backend]
      fl = @fileLists[backend] = {} if not fl?
      fl[itemName] = true

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
              bk = new backend(itemName)
              if @uiController.tournament? and bk.fileName() == @uiController.tournament.backend.fileName()
                @uiController.setTournament null
                btn = $('#open-modal .modal-footer .modal-cancel')
                btn.addClass 'disabled'
                btn.css 'pointer-events', 'none'
                $('#open-modal .modal-header .modal-cancel').remove()
              bk.delete()
              delete fl[itemName]
              itemNode.remove()

              textBox[0].readOnly = true
              animDiv.transition
                x: 0
              return false
          else
            if newName == itemName
              textBox[0].readOnly = true
              animDiv.transition
                x: 0
              return false
            if @filenameAvailable newName, backend
              be = new backend(itemName)
              be.rename(newName)
              textBox[0].readOnly = true
              delete fl[itemName]
              fl[newName] = true
              itemNode.find('.omodal-label').html(newName)
              itemName = newName
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
          newName == itemName or @filenameAvailable newName, backend

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
        textBox[0].value = itemName
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
        to = new Tournament(new backend(itemName))
        @openModal.modal 'hide'
        @uiController.setTournament to

    newItem: (item, backend) ->
      be = new backend(item)
      be.save (JSON.stringify
        name: item), =>
        @addItem item, backend
      
    filenameAvailable: (fileName, backend) ->
      return false if fileName == ""
      fl = @fileLists[backend]
      return true if not fl?
      return not fl[fileName]

    prepareFileReader: ->
      dragClass: "dropbox"
      readAsDefault: "Text"
      readAsMap: {}
      on:
        beforestart: (file) ->
          return (file.name.match /\.atab$/)?
        loadend: (e, file) =>
          name = (file.name.match /^(.*?)(\.atab)?$/)[1]
          while not @filenameAvailable name, LocalBackend
            name = name + ' (2)'
          be = new LocalBackend(name)
          be.save e.target.result, =>
            @addItem name, LocalBackend
        groupend: =>
          @resetAdd()

