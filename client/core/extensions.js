var _ = require('lodash')
var $ = require('jquery')
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
    return modules = _.uniq(modules)
  }

  setUpRoutes () {
    return this.ui.app.config(['$routeProvider', $routeProvider => {
      return (() => {
        var opts

        for (var ext of this.extensions) {
          var route = this.callMemberFunction(ext, 'route')

          if (route != null) {
            if (typeof route === 'string') {
              opts = this.callMemberFunction(ext, 'routeOpts')

              if (typeof opts !== 'object') {
                const reactComponent = this.callMemberFunction(ext, 'reactComponent')
                if (!reactComponent) {
                  this.throwError(ext, 'if "route" is present and "reactComponent" is not, "routeOpts" should return an object')
                }
                const componentName = _.uniqueId('ReactComponent')
                window.ARGOTabs.reactComponents = window.ARGOTabs.reactComponents || {}
                window.ARGOTabs.reactComponents[componentName] = reactComponent
                opts = {
                  template: `<react-component name="ARGOTabs.reactComponents.${componentName}" props="reactProps" watch-depth="reference"/>`,
                  controller: ['$scope', '$rootScope', ($scope, $rootScope) => {
                    const dispatch = (f) => {
                      f()
                      $scope.reactProps = {
                        tournament: $scope.tournament,
                        dispatch
                      }
                    }
                    dispatch(() => {})
                  }]
                }
              }

              $routeProvider.when(route, opts)
            } else if (typeof route === 'function') {
              route.bind(ext)($routeProvider)
            } else {
              this.throwError(ext, '"route" should return a string or a function')
            }
          }
        }
      })()
    }])
  }

  setUpSidebar () {
    var rcat
    var categories = {}

    for (var ext of this.extensions) {
      var category = this.callMemberFunction(ext, 'sidebarCategory')

      if (category != null) {
        if (typeof category === 'string') {
          category = {
            name: category
          }
        } else if (typeof category === 'object') {
          if (!(category.name != null)) {
            this.throwError(ext, '"sidebarCategory" must have a "name"')
          }
        } else {
          this.throwError(ext, '"sidebarCategory" should return a string or a function')
        }

        rcat = categories[category.name]

        if (rcat != null) {
          if (category.sortToken != null) {
            if (rcat.sortToken != null) {
              if (rcat.sortToken !== category.sortToken) {
                console.log(
                  category.name + ': category sort token mismatch: ' + rcat.sortToken + ', ' + category.sortToken
                )
              }
            } else {
              rcat.sortToken = category.sortToken
            }
          }
        } else {
          category.items = []
          rcat = categories[category.name] = category
        }

        item = this.callMemberFunction(ext, 'sidebarItem')

        if (item != null) {
          if (typeof item === 'string') {
            item = {
              name: item
            }
          }

          if (typeof item === 'object') {
            if (!(item.name != null) && !(item.html != null)) {
              this.throwError(ext, '"sidebarItem" must have a "name" or a "html"')
            }
          } else {
            this.throwError(ext, '"sidebarItem" should return a string or an object')
          }

          if (!(item.href != null)) {
            item.href = this.callMemberFunction(ext, 'route')

            if (!(item.href != null) || typeof item.href !== 'string') {
              this.throwError(ext, "\"route\" must be a string if \"sidebarItem\" doesn't have href")
            }
          }

          rcat.items.push(item)
        }
      }
    }

    var sortedCategories = _.sortBy(Object.keys(categories), function (o) {
      var obj = categories[o]
      return (obj.sortToken != null ? obj.sortToken : obj.name)
    })

    var html = ''

    for (var name of sortedCategories) {
      category = categories[name]
      html +=
        '<div class="panel panel-default">' +
          '<div class="panel-heading">' + name + '</div>' +
          '<ul class="list-group">'

      var items = _.sortBy(category.items, function (o) {
        return (o.sortToken != null ? o.sortToken : o.name)
      })

      for (var item of items) {
        if (item.html != null) {
          html += item.html
        } else {
          html += '<nav-li li-href="' + item.href + '">' + item.name + '</nav-li>'
        }
      }

      html += '</ul></div>'
    }

    return $('#sidebar-nav').html(html)
  }
}
