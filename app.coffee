autoprefixer    = require 'autoprefixer-stylus'
rupture         = require 'rupture'
ClientTemplates = require 'client-templates'
CacheManifest   = require 'roots-cache-manifest'

module.exports =
  extensions: [ClientTemplates(
    base: "views/templates/"
    pattern: "*.jade"
    out: "js/templates.js"
  ), CacheManifest(
    manifest: "assets/manifest.appcache"
  )]

  ignores: ['readme.md', '**/layout.*', '**/_*', '**/.gitignore', '**/.*.sw*', '**/.DS_Store', 'Procfile', 'server.js']
  watcher_ignores: ['**/*.sw*', 'node_modules/**/*']

  stylus:
    use: [autoprefixer(), rupture()]
