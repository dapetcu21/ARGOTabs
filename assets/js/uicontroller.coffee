define ['jquery', 'opencontroller', 'alertcontroller', 'localbackend', 'B64', 'jquery.bootstrap'], ($, OpenController, AlertController, LocalBackend, B64) ->
  class UIController
    constructor: ->
      $(document).ready =>
        @open()

        $(".fixed-menu").mouseover ->
          submenuPos = $(this).offset().left + 325
          windowPos  = $(window).width()
          oldPos     = $(this).offset().left + $(this).width()
          newPos     = $(this).offset().left - $(this).width()

          $(this).find('ul').offset
            "left": if submenuPos > windowPos then newPos else oldPos

        $('.action-open').click =>
          @open()

        $('.action-download').click =>
          @download()

        $('.action-saveaslocal').click =>
          @saveaslocal()


    open: ->
      @save =>
        new OpenController(this)

    save: (fn) ->
      if @tournament
        @tournament.save fn
      else
        fn()

    download: ->
      return if not @tournament
      data = B64.encode @tournament.toFile()
      $('body').append '<a id="downloader" download="' + @tournament.name + '.atab" href="data:application/octet-stream;base64,' + data + '"></a>'
      link = $('#downloader')
      link[0].click()
      link.remove()

    saveaslocal: ->
      invalid = {}
      LocalBackend.listFiles (fileList) ->
        for file in fileList
          invalid[file] = true

      new AlertController
        title: "Save as"
        htmlMessage: templates.saveAs
          value: @tournament.backend.fileName() + " (2)"
        buttons: ['Cancel', 'Save']
        cancelButtonIndex: 0
        width: 400
        onShow: (alert) =>
          textBox = alert.find('.saveas-text')
          controlGroup = alert.find('.saveas-control-group')

          textBox.bind 'input propertychange', =>
            newName = textBox[0].value
            if invalid[newName]
              controlGroup.addClass 'error'
            else
              controlGroup.removeClass 'error'

          if invalid[textBox[0].value]
            controlGroup.addClass 'error'

          textBox.keypress (e) =>
            if e.which == 13
              alert.find('.btn-primary').click()

        onShown: (alert) =>
          textBox = alert.find('.saveas-text')
          textBox.focus()

        onClick: (alert, index) =>
          if index == 1
            newName = alert.find('.saveas-text')[0].value
            if not invalid[newName]
              try
                be = new LocalBackend(newName)
                data = @tournament.toFile
                be.save data, =>
                  alert.modal('hide')
              catch e
                console.log e.message

    getTournament: -> @tournament
    setTournament: (@tournament) ->
      if @tournament
        @tournament.load =>
          name = @tournament.name
          $('.view-title').html 'ARGO Tabs' + if name then ' - ' + name else ''
      else
        $('.view-title').html 'ARGO Tabs'

