const B64 = require('B64')
const Cookies = require('cookies')
const OpenController = require('./opencontroller')
const AlertController = require('./alertcontroller')
const Extensions = require('./extensions')
const Tournament = require('../models/tournament')
const Backend = require('../models/backend')
const JSONSource = require('../models/backends/jsonsource')
const $ = require('jquery')
const angular = require('angular')
const templateSaveAs = require('./templates/saveAs.jade')
const templateAlert = require('./templates/alert.jade')

const LocalBackend = Backend.backendForSchema('local')

class UIController {
  setUpUI () {
    $('.fixed-menu').mouseover(function () {
      var submenuPos = $(this).offset().left + 325
      var windowPos = $(window).width()
      var oldPos = $(this).offset().left + $(this).width()
      var newPos = $(this).offset().left - $(this).width()

      return $(this).find('ul').offset({
        'left': (submenuPos > windowPos ? newPos : oldPos)
      })
    })

    $('.action-open').click(() => {
      return this.open()
    })

    $('.action-download').click(() => {
      return this.download()
    })

    $('.action-download-censored').click(() => {
      return this.downloadCensored()
    })

    $('.action-saveaslocal').click(() => {
      return this.saveaslocal()
    })

    return $('.action-save').click(() => {
      return this.save()
    })
  }

  constructor () {
    var app
    this.extensions = new Extensions(this)
    this.app = app = angular.module('argotabs', this.extensions.angularModules())

    app.controller('LoadingCtrl', ['$scope', $scope => {
      $scope.loaded = true
    }])

    app.controller('AppCtrl', () => {
      this.setUpUI()
    })

    $(document).ready(() => {
      this.extensions.setUpRoutes()
      this.extensions.setUpSidebar()

      this.injector = angular.bootstrap(document, ['argotabs'])

      this.rootApply(scope => {
        scope.tournamentLoaded = false
        scope.loadingTournament = false
      })

      this.loadSession(() => {
        this.setTournament(null)
        this.open()
      })
    })

    this.autosaveStopped = 0

    setInterval(() => {
      if (!this.autosaveStopped) {
        this.save(() => {}, true)
      }
    }, 5000)
  }

  rootApply (fn) {
    this.injector.invoke(['$rootScope', function ($rootScope) {
      $rootScope.$apply(fn($rootScope))
    }])
  }

  open (fn = () => {}) {
    this.save(() => {
      this.openController = new OpenController(this, () => {
        this.saveSession(null)
        fn()
      }, () => {
        this.saveSession(this.tournament)
        this.openController = null
      })
    })
  }

  saveSession (tournament) {
    if (tournament) {
      Cookies.set('ARGOTabs_lastURL', tournament.source.url())
    } else {
      Cookies.expire('ARGOTabs_lastURL')
    }
  }

  loadSession (onFail = (function () {}), onOpen = (function () {})) {
    let lastURL = Cookies.get('ARGOTabs_lastURL')
    const locationURL = window.location.href.match(/^[^#]*#\/url\/([^#]*)#?(.*)$/)

    if (locationURL) {
      lastURL = decodeURIComponent(locationURL[1])
      window.history.replaceState(null, '', '/#' + locationURL[2])
    }

    try {
      if (!lastURL) {
        throw new Error('No session to resume')
      }

      const source = Backend.load(lastURL)

      if (!source.exists()) {
        throw new Error('Entry for ' + lastURL + 'does not exist')
      }

      this.setTournament(new Tournament(source), () => {
        onOpen()
      })
    } catch (e) {
      onFail()
    }
  }

  save (fn, autosave = false) {
    var btns
    var btn;
    (fn != null ? fn : fn = function () {})

    if (this.tournament && this.tournament.source.canSave()) {
      btn = $('.action-save')
      btns = $('.view-save')
      btn.button('loading')
      clearTimeout(this._saveTimer)
      this.autosaveStopped++

      try {
        var callback = () => {
          this.autosaveStopped--
          btn.button('saved')
          btns.addClass('btn-success')
          btns.removeClass('btn-info')

          this._saveTimer = setTimeout(function () {
            btn.button('reset')
            btns.addClass('btn-info')
            btns.removeClass('btn-success')
          }, 1000)

          fn()
        }

        if (autosave) {
          if (!this.tournament.saveIfRequired(callback)) {
            this.autosaveStopped--
            btn.button('reset')
          }
        } else {
          this.tournament.save(callback)
        }
      } catch (e) {
        new AlertController({
          title: 'Saving error',
          message: e.message,
          buttons: e.canForce ? [e.canForce, 'OK'] : ['OK'],
          cancelButtonIndex: (e.canForce ? 1 : 0),

          onClick: (alert, idx) => {
            var button

            if ((e.canForce && idx === 0)) {
              button = alert.find('.modal-footer').children().first()
              button[0].dataset.loading = 'Saving...'
              button.button('loading')

              try {
                this.tournament.save(function () {
                  alert.modal('hide')
                  return fn()
                }, true)
              } catch (e) {
                if (e.canForce) {
                  button.show()
                  button.html(e.canForce)
                } else {
                  button.hide()
                }

                button.button('reset')
                return alert.find('.modal-body').html('<p>' + e.message + '</p>')
              }
            }
          },

          onDismissed: () => {
            btn.button('reset')
            return this.autosaveStopped--
          }
        })
      }
    } else {
      return fn()
    }
  }

  downloadName () {
    var date = new Date()

    return [
      this.tournament.name,
      [date.getFullYear(), date.getMonth(), date.getDay()].join('-'),
      [date.getHours(), date.getMinutes(), date.getSeconds()].join('-')
    ].join('_')
  }

  download () {
    if (!this.tournament) {
      return
    }

    var data = B64.encode(this.tournament.toFile())

    $('body').append(
      '<a id="downloader" download="' + this.downloadName() + '.atab" href="data:application/octet-stream;base64,' + data + '"></a>'
    )

    var link = $('#downloader')
    link[0].click()
    return link.remove()
  }

  downloadCensored () {
    if (!this.tournament) {
      return
    }

    var source = new JSONSource(this.tournament.toFile())
    var newTournament = new Tournament(source)

    return newTournament.load(() => {
      newTournament.censor(this.extensions)
      var data = B64.encode(newTournament.toFile())

      $('body').append(
        '<a id="downloader" download="' + this.downloadName() + ' (censored).atab" href="data:application/octet-stream;base64,' + data + '"></a>'
      )

      var link = $('#downloader')
      link[0].click()
      return link.remove()
    })
  }

  saveaslocal () {
    return new AlertController({
      title: 'Save as',

      htmlMessage: templateSaveAs({
        value: this.tournament.source.fileName() + ' (2)'
      }),

      buttons: ['Cancel', 'Save'],
      cancelButtonIndex: 0,
      width: 400,

      onShow: alert => {
        var textBox = alert.find('.saveas-text')
        var controlGroup = alert.find('.saveas-control-group')

        textBox.bind('input propertychange', () => {
          var newName = textBox[0].value

          if (LocalBackend.load(LocalBackend.urlFromFileName(newName)).exists()) {
            return controlGroup.addClass('error')
          } else {
            return controlGroup.removeClass('error')
          }
        })

        if (LocalBackend.load(LocalBackend.urlFromFileName(textBox[0].value)).exists()) {
          controlGroup.addClass('error')
        }

        return textBox.keypress(e => {
          if (e.which === 14) {
            return alert.find('.btn-primary').click()
          }
        })
      },

      onShown: alert => {
        var textBox = alert.find('.saveas-text')
        return textBox.focus()
      },

      onClick: (alert, index, buttonName, force = false) => {
        var source
        var newName
        var thisFunction

        if (index === 1) {
          thisFunction = arguments.callee
          newName = alert.find('.saveas-text')[0].value
          source = LocalBackend.load(LocalBackend.urlFromFileName(newName))

          if (!source.exists()) {
            if (!force) {
              alert.find('.btn-primary').button('loading')
            }

            try {
              var data = this.tournament.toFile()

              source.save(data, () => {
                alert.modal('hide')
              }, force)
            } catch (e) {
              var btnDanger
              alert.find('.btn-primary').button('reset')
              alert.find('.saveas-error').remove()

              alert.find('.modal-body').append(templateAlert({
                classes: 'saveas-error alert-error' + ((() => {
                  if (e.canForce) {
                    return ' alert-block'
                  }
                })()),

                title: 'Error while saving file:',
                message: e.message,
                button: e.canForce,
                buttonClass: 'btn-danger'
              }))

              if (e.canForce) {
                btnDanger = alert.find('.btn-danger')
                btnDanger[0].dataset.loading = 'Saving...'

                btnDanger.click(() => {
                  btnDanger.button('loading')
                  thisFunction(alert, index, null, true)
                })
              }
            }
          }
        }
      }
    })
  }

  getTournament () {
    return this.tournament
  }

  setTournament (tournament, cb = (function () {}), errcb = (function () {})) {
    this.tournament = tournament

    if (!tournament) {
      this.saveSession(null)
      this.rootApply(function (sc) {
        sc.tournament = null
        sc.tournamentLoaded = false
      })
      return
    }

    this.rootApply(function (sc) {
      sc.loadingTournament = true
    })

    tournament.load(() => {
      this.saveSession(tournament)
      this.rootApply(function (sc) {
        sc.tournament = tournament
        sc.tournamentLoaded = true
        sc.loadingTournament = false
        cb()
      })
    }, err => {
      this.setTournament(null)
      console.log(err.stack)

      new AlertController({
        buttons: ['OK'],
        primaryButtonIndex: 0,
        closeable: false,
        animated: false,
        id: 'open-tournament-error',
        height: 200,
        title: 'Error',
        message: "Can't open tournament: " + err.message,

        onShow: () => {
          this.rootApply(function (sc) {
            sc.loadingTournament = false
          })
        },

        onClick: (alert, bIndex, bName) => {
          if (bIndex === 0) {
            return this.open(function () {
              return alert.modal('hide')
            })
          }
        }
      })

      errcb(err)
    })
  }
}

module.exports = UIController
