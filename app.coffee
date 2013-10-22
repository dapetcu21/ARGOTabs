# ----------------------------------------
# Project Configuration
# ----------------------------------------

# Files in this list will not be compiled - minimatch supported

ignore_files: ['_*', '.*.swp', '.*.swo', 'readme*', '.gitignore', '.DS_Store']
ignore_folders: ['.git']
watcher_ignore_files: ['.*.swp', '.*.swo']

# Layout file config
# `default` applies to all views. Overrides for specific
# views are possible - the path to the view with the custom
# layout is the key, and the path to the layout is the value.

layouts:
  'index.jade': 'layout.jade'

# Locals will be made available on every page. They can be
# variables or (coffeescript) functions.

locals:
  title: 'ARGO Tabs'

# If you are working with a client-side js framework that would benefit
# from precompiled templates, set this variable to the location of a folder
# that contains your templates. they will be precompiled to public/js/templates.js
# and made available under window.templates if you load the templates.js script.

templates:'views/templates'
