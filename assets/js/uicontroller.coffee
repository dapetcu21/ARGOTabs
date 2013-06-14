define ['jquery', 'opencontroller', 'alertcontroller', 'localbackend', 'B64', 'routes', 'jquery.bootstrap'], ($, OpenController, AlertController, LocalBackend, B64, Routes) ->
  class UIController
    constructor: ->
      @app = app = angular.module 'argotabs', []

      app.controller 'MainCtrl', ['$scope', ($scope) =>
        $scope.ui = this
      ]

      Routes(this)

      @injector = angular.bootstrap $('body').get(), ['argotabs']

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

        $('.action-save').click =>
          @save()


    open: ->
      @save =>
        new OpenController(this)

    save: (fn) ->
      fn ?= ->
      if @tournament
        btn = $('.action-save')
        btns = $('.view-save')
        btn.button 'loading'
        clearTimeout @_saveTimer
        try
          @tournament.save =>
            btn.button 'saved'
            btns.addClass 'btn-success'
            btns.removeClass 'btn-info'
            #btns.switchClass 'btn-success', 'btn-info', 1000
            @_saveTimer = setTimeout ->
              btn.button 'reset'
              btns.addClass 'btn-info'
              btns.removeClass 'btn-success'
            , 1000
            fn()
        catch e
          new AlertController
            title: "Saving error"
            message: e.message
            buttons: if e.canForce then [e.canForce, 'OK'] else ['OK']
            cancelButtonIndex: if e.canForce then 1 else 0
            onClick: (alert, idx) =>
              if (e.canForce and idx == 0)
                button = alert.find('.modal-footer').children().first()
                button[0].dataset.loading-text = "Saving..."
                button.button('loading')
                try
                  @tournament.save (->
                    alert.modal('hide')
                    fn()), true
                catch e
                  if e.canForce
                    button.show()
                    button.html e.canForce
                  else
                    button.hide()
                  button.button('reset')
                  alert.find('.modal-body').html '<p>' + e.message + '</p>'
            onDismissed: ->
              btn.button 'reset'

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

        onClick: (alert, index, buttonName, force = false) =>
          if index == 1
            thisFunction = arguments.callee
            newName = alert.find('.saveas-text')[0].value
            if not invalid[newName]
              if not force
                alert.find('.btn-primary').button('loading')
              try
                be = new LocalBackend(newName)
                data = @tournament.toFile
                be.save data, (=>
                  alert.modal('hide')), force
              catch e
                alert.find('.btn-primary').button('reset')
                alert.find('.saveas-error').remove()
                alert.find('.modal-body').append templates.alert
                  classes: 'saveas-error alert-error' + (' alert-block' if e.canForce)
                  title: "Error while saving file:"
                  message: e.message
                  button: e.canForce
                  buttonClass: "btn-danger"
                if e.canForce
                  btnDanger = alert.find('.btn-danger')
                  btnDanger[0].dataset.loading-text = "Saving..."
                  btnDanger.click =>
                    btnDanger.button('loading')
                    thisFunction(alert, index, null, true)

    updateAngular: ->
      @injector.invoke ['$rootScope', ($rootScope)->
        $rootScope.$digest()
      ]

    getTournament: -> @tournament
    setTournament: (tournament) ->
      @tournament = tournament
      tournament.load =>
        @updateAngular()
