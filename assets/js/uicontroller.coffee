define ['jquery', 'B64', 'cookies', 'opencontroller', 'alertcontroller', 'tournament', 'backends', 'localbackend', 'routes/routes', 'util', 'round', 'components', 'editable-table', 'angular'], ($, B64, Cookies, OpenController, AlertController, Tournament, Backends, LocalBackend, Routes, Util, Round) ->
  class UIController
    constructor: ->
      @app = app = angular.module 'argotabs', ['components', 'editable-table']

      app.controller 'LoadingCtrl', ['$scope', ($scope) =>
        $scope.loaded = true
      ]

      app.controller 'RoutesList', ['$scope', '$location', ($scope, $location) =>
        $scope.addRound = =>
          t = @tournament
          t.rounds.push new Round t

        $scope.removeRound = (i) =>
          new AlertController
            buttons: ['Cancel', 'Delete']
            cancelButtonIndex: 0
            primaryButtonIndex: 1
            title: 'Delete Round ' + (i+1)
            width: 400
            htmlMessage: '<p>Are you sure you want to delete Round '+(i+1)+'?</p><p>This will remove the pairing, all ballots and all scores associated with this round. Most mistakes can be corrected without deleting the whole round.</p>'
            onClick: (alert, bIndex, bName) =>
              if bIndex == 1
                $scope.$apply =>
                  if $location.path().match(/^\/round/)
                    $location.path('/')
                  t = @tournament
                  r = t.rounds[i]
                  t.rounds.splice i, 1
                  r.destroy()
                  alert.modal('hide')
      ]

      Routes(this)

      @injector = angular.bootstrap document, ['argotabs']

      $(document).ready =>
        @loadSession =>
          new OpenController this

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
      
      @autosaveStopped = 0
      setInterval =>
        if not @autosaveStopped
          @save (->), true
      , 5000

    open: ->
      @save =>
        new OpenController(this)

    loadSession: (onFail) ->
      lastBackend = Cookies.get 'lastBackend'
      lastFileName = Cookies.get 'lastFileName'
      found = false
      if lastBackend and lastFileName
        for backend in Backends
          if Util.getClass(backend) == lastBackend
            try
              backend.listFiles (fileList) =>
                if fileList.indexOf(lastFileName) != -1
                  @setTournament new Tournament(new backend(lastFileName))
                  found = true
            catch e
              console.log e.message
            break
      if not found
        onFail()

    save: (fn, autosave = false) ->
      fn ?= ->
      if @tournament
        btn = $('.action-save')
        btns = $('.view-save')
        btn.button 'loading'
        clearTimeout @_saveTimer
        @autosaveStopped++
        try
          callback = =>
            @autosaveStopped--
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
          if autosave
            if not @tournament.saveIfRequired callback
              @autosaveStopped--
              btn.button 'reset'
          else
            @tournament.save callback
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
            onDismissed: =>
              btn.button 'reset'
              @autosaveStopped--
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

    getTournament: -> @tournament
    setTournament: (tournament) ->
      @tournament = tournament
      if tournament
        tournament.load =>
          Cookies.set 'lastBackend', Util.getObjectClass tournament.backend
          Cookies.set 'lastFileName', tournament.backend.fileName()
          @injector.invoke ['$rootScope', ($rootScope)->
            $rootScope.$apply ->
              $rootScope.tournament = tournament
          ]
      else
        Cookies.expire 'lastBackend'
        Cookies.expire 'lastFileName'
        @injector.invoke ['$rootScope', ($rootScope)->
          $rootScope.$apply ->
            $rootScope.tournament = nil
        ]
