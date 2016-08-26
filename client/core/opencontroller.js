var AlertController = require('./alertcontroller')
var Tournament = require('../models/tournament')
var Backend = require('../models/backend')
var $ = require('jquery')
require('jquery.transit')
var templateDisclaimer = require('./templates/disclaimer.jade')
var templateOpenModal = require('./templates/openModal.jade')
var templateOpenModalAddLocal = require('./templates/openModalAddLocal.jade')
var templateOpenModalAddItem = require('./templates/openModalAddItem.jade')
var LocalBackend = Backend.backendForSchema('local')

class OpenController {
  constructor (uiController, onReady = (function () {}), onDismiss = (function () {})) {
    var openModal
    this.uiController = uiController
    this.closeable = this.uiController.getTournament() != null

    this.alertController = new AlertController({
      title: 'Open tournament file',
      id: 'open-modal',
      closeable: this.closeable,
      animated: this.closeable,

      buttons: (() => {
        if (this.closeable) {
          return ['Cancel']
        } else {
          return []
        }
      })(),

      primaryButtonIndex: -1,
      cancelButtonIndex: 0,
      width: 350,
      height: (this.closeable ? 310 : 250),
      htmlMessage: templateOpenModal(),

      onShown: function () {
        var discl = $(templateDisclaimer())
        discl.appendTo($('.modal-backdrop'))

        if (this.closeable) {
          setTimeout(function () {
            return discl.addClass('in')
          }, 0)

          return discl.find('a').click(function (e) {
            e.preventDefault()
            window.location = e.currentTarget.href
            return false
          })
        } else {
          return discl.addClass('in')
        }
      },

      onShow: onReady,
      onDismiss: onDismiss
    })

    this.openModal = openModal = $('#open-modal')

    openModal.find('#omodal-add-a1').click(() => {
      return openModal.find('.omodal-add-div').transition({
        x: '-33.33%'
      })
    })

    openModal.find('.omodal-btn-close').click(() => {
      return this.resetAdd()
    })

    openModal.find('#omodal-btn-new').click(() => {
      var newNode = $('#omodal-add-page3').html(templateOpenModalAddLocal)

      newNode.find('.omodal-btn-close').click(() => {
        return this.resetAdd()
      })

      var textBox = newNode.find('.omodal-text')

      textBox.keypress(e => {
        var source
        var newName

        if (e.which === 13 && !textBox[0].readOnly) {
          newName = textBox[0].value
          source = LocalBackend.load(LocalBackend.urlFromFileName(newName))

          if (!source.exists()) {
            textBox[0].readOnly = true
            this.newItem(source)
            this.resetAdd()
            return false
          }
        }

        return true
      })

      var controlGroup = textBox.parent()

      textBox.bind('input propertychange', () => {
        var newName = textBox[0].value
        var source = LocalBackend.load(LocalBackend.urlFromFileName(newName))

        if (!source.exists()) {
          return controlGroup.removeClass('error')
        } else {
          return controlGroup.addClass('error')
        }
      })

      return openModal.find('.omodal-add-div').transition({
        x: '-66.66%'
      }, function () {
        return textBox.focus()
      })
    })

    Backend.list(this.addItem.bind(this))

    openModal.find('#omodal-btn-upload').click(() => {
      return openModal.find('.omodal-file').click()
    })

    const onHover = setTo => evt => {
      evt.stopPropagation()
      evt.preventDefault()
      openModal.toggleClass('dropbox', setTo)
    }

    const onDrop = evt => {
      onHover(false)(evt)
      const files = evt.target.files || evt.originalEvent.dataTransfer.files || []
      for (let i = 0; i < files.length; i++) {
        this.processFile(files[i])
      }
      this.resetAdd()
    }

    openModal.on('dragover', onHover(true))
    openModal.on('dragleave', onHover(false))
    openModal.on('drop', onDrop)
    openModal.find('.omodal-file').on('change', onDrop)
  }

  processFile (file) {
    const reader = new window.FileReader()
    reader.onload = e => {
      let source
      let name = (file.name.match(/^(.*?)(\.atab)?$/))[1]

      while ((source = LocalBackend.load(LocalBackend.urlFromFileName(name))) && source.exists()) {
        name = name + ' (2)'
      }

      source.save(e.target.result, () => {
        this.addItem(source)
      })
    }
    reader.readAsText(file)
  }

  resetAdd () {
    var div = this.openModal.find('.omodal-add-div')

    return div.transition({
      x: 0
    }, () => {
      return div.find('#omodal-add-page3').html('')
    })
  }

  addItem (source) {
    var validateEntry

    var item = {
      name: source.fileName(),
      icon: source.backend.icon() || '<i class="fa fa-fw fa-question"></i>'
    }

    var itemNode = $(templateOpenModalAddItem(item))
    itemNode.insertBefore(this.openModal.find('#open-modal-add-tr'))
    var animDiv = itemNode.find('.omodal-edit-div')
    var textBox = itemNode.find('.omodal-text')
    var controlGroup = textBox.parent()

    textBox.keypress(e => {
      var btn
      var newName

      if (e.which === 13 && !textBox[0].readOnly) {
        newName = textBox[0].value

        if (textBox[0].ongoingDeletion) {
          if (newName === 'confirm deletion of file') {
            if (this.uiController.tournament != null && source.url() === this.uiController.tournament.source.url()) {
              this.uiController.setTournament(null)
              btn = $('#open-modal .modal-footer .modal-cancel')
              btn.addClass('disabled')
              btn.css('pointer-events', 'none')
              $('#open-modal .modal-header .modal-cancel').remove()
            }

            source.delete()
            itemNode.remove()
            textBox[0].readOnly = true

            animDiv.transition({
              x: 0
            })

            return false
          }
        } else {
          if (newName === item.name) {
            textBox[0].readOnly = true

            animDiv.transition({
              x: 0
            })

            return false
          }

          if (source.canRename(newName)) {
            source.rename(newName)
            textBox[0].readOnly = true
            itemNode.find('.omodal-label').html(newName)
            item.name = newName

            animDiv.transition({
              x: 0
            })

            return false
          }
        }
      }

      return true
    })

    textBox.bind('input propertychange', validateEntry = () => {
      var newName = textBox[0].value
      var ongoingDeletion = textBox[0].ongoingDeletion

      var valid = (() => {
        if (ongoingDeletion) {
          return newName === 'confirm deletion of file'
        } else {
          return newName === item.name || source.canRename(newName)
        }
      })()

      if (valid) {
        controlGroup.removeClass('error')

        if (ongoingDeletion) {
          return controlGroup.addClass('success')
        } else {
          return controlGroup.removeClass('success')
        }
      } else {
        controlGroup.removeClass('success')
        return controlGroup.addClass('error')
      }
    })

    itemNode.find('.omodal-btn-close').click(() => {
      textBox[0].readOnly = true

      return animDiv.transition({
        x: 0
      })
    })

    itemNode.find('.omodal-btn-edit').click(() => {
      textBox[0].placeholder = 'Type the new file name'
      textBox[0].value = item.name
      textBox[0].readOnly = false
      textBox[0].ongoingDeletion = false
      validateEntry()

      return animDiv.transition({
        x: '-50%'
      }, function () {
        return textBox.focus()
      })
    })

    itemNode.find('.omodal-btn-delete').click(() => {
      textBox[0].placeholder = 'Type "confirm deletion of file"'
      textBox[0].value = ''
      textBox[0].readOnly = false
      textBox[0].ongoingDeletion = true
      validateEntry()

      return animDiv.transition({
        x: '-50%'
      }, function () {
        return textBox.focus()
      })
    })

    return itemNode.find('.omodal-a').click(() => {
      var to = new Tournament(source)
      this.openModal.modal('hide')
      this.uiController.setTournament(to)
    })
  }

  newItem (source) {
    return source.save((JSON.stringify({
      name: source.fileName()
    })), () => {
      return this.addItem(source)
    })
  }
}

module.exports = OpenController
