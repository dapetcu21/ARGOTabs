define ['extensions/index', 'underscore', 'angular-route'], (extensionsArray, _) ->
  class Extensions
    constructor: (ui) ->
      @extensions = extensions = []
      @ui = ui
      do crawl = (extensionsArray) ->
        for Ext in extensionsArray
          if typeof Ext == 'object'
            crawl(Ext)
          else if typeof Ext != 'function'
            throw new Error('Extension is not a constructor function')
          else
            extensions.push new Ext(ui)
        return

    throwError: (instance, string) ->
      throw new Error((instance.constructor.name or '<Extension>') + ': ' + string)
        
    callMemberFunction: (instance, member) ->
      f = instance[member]
      if typeof f == 'undefined'
        return undefined
      if typeof f != 'function'
        @throwError('"' + member + '" is not a function')
      f.bind(instance)()

    angularModules: () ->
      modules = []
      for ext in @extensions
        res = @callMemberFunction(ext, 'angularModules')
        if res?
          if typeof res == 'string'
            modules.push res
          else if typeof res == 'object'
            modules.push.apply(modules, res)
          else
            @throwError(ext, '"angularModules" should return a string or an array')
      modules.push 'ngRoute'
      modules = _.uniq(modules)

    setUpRoutes: () ->
      @ui.app.config ['$routeProvider', ($routeProvider) =>
        for ext in @extensions
          route = @callMemberFunction(ext, 'route')
          if route?
            if typeof route == 'string'
              opts = @callMemberFunction(ext, 'routeOpts')
              if typeof opts != 'object'
                @throwError(ext, 'if "route" is present, "routeOpts" should return an object')
              $routeProvider.when route, opts
            else if typeof route = 'function'
              route($routeProvider)
            else
              @throwError(ext, '"route" should return a string or a function')
      ]

    setUpSidebar: () ->
      categories = {}
      for ext in @extensions
        category = @callMemberFunction(ext, 'sidebarCategory')
        if category?
          if typeof category == 'string'
            category = {name:category}
          else if typeof category == 'object'
            if not category.name?
              @throwError(ext, '"sidebarCategory" must have a "name"')
          else
            @throwError(ext, '"sidebarCategory" should return a string or a function')
          rcat = categories[category.name]
          if rcat?
            if category.sortToken?
              if rcat.sortToken?
                if rcat.sortToken != category.sortToken
                  console.log category.name + ': category sort token mismatch: ' + rcat.sortToken + ', ' + category.sortToken
              else
                rcat.sortToken = category.sortToken
          else
            category.items = []
            rcat = categories[category.name] = category
          item = @callMemberFunction(ext, 'sidebarItem')
          if item?
            if typeof item == 'string'
              item =
                name: item
            if typeof item == 'object'
              if not item.name?
                @throwError(ext, '"sidebarItem" must have a "name"')
            else
              @throwError(ext, '"sidebarItem" should return a string or an object')
            if not item.href?
              item.href = @callMemberFunction(ext, 'route')
              if not item.href? or typeof item.href != 'string'
                @throwError(ext, '"route" must be a string if "sidebarItem" doesn\'t have href')
            rcat.items.push(item)

      sortedCategories = _.sortBy Object.keys(categories), (o) ->
        obj = categories[o]
        if obj.sortToken?
          obj.sortToken
        else
          obj.name

      html = ""
      for name in sortedCategories
        category = categories[name]
        html += '<li class="nav-header">'+name+'</li>'
        items = _.sortBy category.items, (o) ->
          if o.sortToken?
            o.sortToken
          else
            o.name
        for item in items
          html += '<nav-li href="'+item.href+'">'+item.name+'</nav-li>'
      $('#sidebar-nav').html(html)
