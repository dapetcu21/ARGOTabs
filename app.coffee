autoprefixer    = require 'autoprefixer-stylus'
rupture         = require 'rupture'
ClientTemplates = require 'client-templates'

module.exports =
  extensions: [ClientTemplates(
    base: "views/templates/"
    pattern: "*.jade"
    out: "js/templates.js"
  )]

  ignores: ['readme.md', '**/layout.*', '**/_*', '**/.gitignore', '**/.*.sw*', '**/.DS_Store']
  watcher_ignores: ['**/*.sw*', 'node_modules/**']

  stylus:
    use: [autoprefixer(), rupture()]
