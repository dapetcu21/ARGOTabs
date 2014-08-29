define [
  'B64',
  'cookies',
  './opencontroller',
  './alertcontroller',
  './extensions'
  '../models/tournament',
  '../models/backend',
  './util',
  './templates',
  'angular'
  'jquery',
  'jquery.bootstrap'
], (B64, Cookies, OpenController, AlertController, Extensions, Tournament, Backend, Util, templates) ->
  LocalBackend = Backend.backendForSchema('local')

  class UIController
    constructor: ->
      @extensions = new Extensions(this)
      @app = app = angular.module 'argotabs', @extensions.angularModules()

      app.controller 'LoadingCtrl', ['$scope', ($scope) =>
        $scope.loaded = true
      ]

      $(document).ready =>
        @extensions.setUpRoutes()
        @extensions.setUpSidebar()
        #TO DO: bootstrap only after tournament has been loaded from cache
        @injector = angular.bootstrap document, ['argotabs'], (sc) ->
          sc.tournament = Tournament.placeholderTournament
        @loadSession =>
          @setTournament null
          new OpenController this, =>
            @rootApply (scope) ->
              scope.tournamentLoaded = true

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

    rootApply: (fn) ->
      @injector.invoke ['$rootScope', ($rootScope)->
        $rootScope.$apply fn($rootScope)
      ]
      return

    open: ->
      @save =>
        new OpenController this, (=>
          @saveSession null
        ), (=>
          @saveSession @tournament
        )

    saveSession: (tournament) ->
      if tournament?
        Cookies.set 'ARGOTabs_lastURL', tournament.source.url()
      else
        Cookies.expire 'ARGOTabs_lastURL'

    loadSession: (onFail) ->
      lastURL = Cookies.get 'ARGOTabs_lastURL'
      try
        if lastURL
          source = Backend.load(lastURL)
          if !source.exists()
            throw new Error('Entry for ' + lastURL + 'does not exist')
          @setTournament new Tournament(source)
        else
          throw new Error('No session to resume')
      catch e
        console.log e
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
      new AlertController
        title: "Save as"
        htmlMessage: templates.saveAs
          value: @tournament.source.fileName() + " (2)"
        buttons: ['Cancel', 'Save']
        cancelButtonIndex: 0
        width: 400
        onShow: (alert) =>
          textBox = alert.find('.saveas-text')
          controlGroup = alert.find('.saveas-control-group')

          textBox.bind 'input propertychange', =>
            newName = textBox[0].value
            if LocalBackend.load(LocalBackend.urlFromFileName(newName)).exists()
              controlGroup.addClass 'error'
            else
              controlGroup.removeClass 'error'

          if LocalBackend.load(LocalBackend.urlFromFileName(textBox[0].value)).exists()
            controlGroup.addClass 'error'

          textBox.keypress (e) =>
            if e.which == 14
              alert.find('.btn-primary').click()

        onShown: (alert) =>
          textBox = alert.find('.saveas-text')
          textBox.focus()

        onClick: (alert, index, buttonName, force = false) =>
          if index == 1
            thisFunction = arguments.callee
            newName = alert.find('.saveas-text')[0].value
            source = LocalBackend.load(LocalBackend.urlFromFileName(newName))
            if not source.exists()
              if not force
                alert.find('.btn-primary').button('loading')
              try
                data = @tournament.toFile()
                source.save data, (=>
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
        @rootApply (sc) ->
          sc.loadingTournament = true
        tournament.load (=>
          @saveSession tournament
          @rootApply (sc) ->
            sc.tournament = tournament
            sc.tournamentLoaded = true
            sc.loadingTournament = false
        ), ((err) =>
          @setTournament null
          console.log(err.stack)
          new AlertController
            buttons: ['OK']
            primaryButtonIndex: 0
            closeable: false
            animated: false
            id: 'open-tournament-error'
            height: 200
            title: 'Error'
            message: "Can't open tournament: " + err.message
            onShow: =>
              @rootApply (sc) ->
                sc.loadingTournament = false
            onClick: (alert, bIndex, bName) =>
              if bIndex == 0
                new OpenController this, ->
                  alert.modal('hide')
        )
      else
        @saveSession null
        @rootApply (sc) ->
          sc.tournament = Tournament.placeholderTournament

