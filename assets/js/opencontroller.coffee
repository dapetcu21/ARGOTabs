define ['jquery', 'filereader', 'tournament', 'backends', 'localbackend', 'templates', 'jquery.transit'], ($, FileReaderJS, Tournament, backends, LocalBackend) ->
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
        textBox.focus()
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
          console.log "plm "
          if @filenameAvailable newName, LocalBackend
            controlGroup.removeClass 'error'
          else
            controlGroup.addClass 'error'

        openModal.find('.omodal-add-div').transition
          x: '-66.66%'

      @fileLists = {}
      for backend in backends
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
        backend: backend

      fl = @fileLists[backend]
      fl = @fileLists[backend] = {} if not fl?
      fl[itemName] = true

      itemNode = @openModal.find("#open-modal-add-tr").before templates.openModalAddItem item
      itemNode = itemNode.prev()

      animDiv = itemNode.find('.omodal-edit-div')
      textBox = itemNode.find('.omodal-text')
      controlGroup = textBox.parent()

      textBox.keypress (e) =>
        if e.which == 13 and not textBox[0].readOnly
          newName = textBox[0].value
          if textBox[0].ongoingDeletion
            if newName == "confirm deletion of file"
              new backend(itemName).delete()
              fl[itemName] = false
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
              fl[itemName] = false
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
        textBox.focus()
        validateEntry()
        animDiv.transition
          x: "-50%"

      itemNode.find('.omodal-btn-delete').click ->
        textBox[0].placeholder = 'Type "confirm deletion of file"'
        textBox[0].value = ''
        textBox[0].readOnly = false
        textBox[0].ongoingDeletion = true
        textBox.focus()
        validateEntry()
        animDiv.transition
          x: "-50%"

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
      on:
        beforestart: (file) ->
          return (file.name.match /\.atab$/)?
        loadend: (e, file) =>
          name = (file.name.match /^(.*?)(\.atab)?$/)[1]
          while not @filenameAvailable name, LocalBackend
            name = name + ' duplicate'
          be = new LocalBackend(name)
          be.save e.target.result, =>
            @addItem name, LocalBackend
        groupend: =>
          @resetAdd()

