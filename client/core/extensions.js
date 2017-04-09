var _ = require('lodash')
require('ngreact')

var extensionsArray = [
  require('../extensions/404'),
  require('../extensions/categories'),
  require('../extensions/clubs'),
  require('../extensions/dashboard'),
  require('../extensions/json'),
  require('../extensions/judges'),
  require('../extensions/loading'),
  require('../extensions/rooms'),
  require('../extensions/rounds'),
  require('../extensions/speaker-rank'),
  require('../extensions/team-rank'),
  require('../extensions/teams'),
  require('../extensions/ui-components'),
  require('../extensions/url'),
  require('../extensions/react-test')
]

module.exports = class Extensions {
  constructor (ui) {
    const extensions = this.extensions = []
    this.ui = ui

    const crawl = extensionsArray => {
      for (var Ext of extensionsArray) {
        if (Ext.default) { Ext = Ext.default }
        if (typeof Ext === 'object') {
          crawl(Ext)
        } else if (typeof Ext !== 'function') {
          throw new Error('Extension is not a constructor function')
        } else {
          extensions.push(new Ext(ui))
        }
      }
    }

    crawl(extensionsArray)
  }

  throwError (instance, string) {
    throw new Error((instance.constructor.name || '<Extension>') + ': ' + string)
  }

  callMemberFunction (instance, member) {
    var f = instance[member]

    if (typeof f === 'undefined') {
      return undefined
    }

    if (typeof f !== 'function') {
      this.throwError('"' + member + '" is not a function')
    }

    return f.call(instance)
  }

  censor (tournament) {
    return (() => {
      for (var ext of this.extensions) {
        if (ext.censor) {
          ext.censor(tournament)
        }
      }
    })()
  }

  angularModules () {
    var modules = []

    for (var ext of this.extensions) {
      var res = this.callMemberFunction(ext, 'angularModules')

      if (res != null) {
        if (typeof res === 'string') {
          modules.push(res)
        } else if (typeof res === 'object') {
          modules.push.apply(modules, res)
        } else {
          this.throwError(ext, '"angularModules" should return a string or an array')
        }
      }
    }

    modules.push('react')
    return _.uniq(modules)
  }

  getRouteOpts (route) {
    const extension = this.extensions.find(ext =>
      this.callMemberFunction(ext, 'route') === route
    )

    if (!extension) { return null }
    if (extension._cachedRouteOpts) { return extension._cachedRouteOpts }

    const routeOpts = this.callMemberFunction(extension, 'routeOpts')
    extension._cachedRouteOpts = routeOpts

    return routeOpts
  }
}
