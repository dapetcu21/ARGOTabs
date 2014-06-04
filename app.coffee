autoprefixer    = require 'autoprefixer-stylus'
rupture         = require 'rupture'
ClientTemplates = require 'client-templates'
CacheManifest   = require 'roots-cache-manifest'
fs              = require 'fs'
W               = require 'when'

module.exports = options =
  extensions: [ClientTemplates(
    base: "views/templates/"
    pattern: "*.jade"
    out: "core/templates.js"
  )
  , CacheManifest(
    manifest: "assets/manifest.appcache"
  )]

  ignores: [
    'readme.md',
    '**/layout.*',
    '**/_*',
    '**/.gitignore',
    '**/.*.sw*',
    '**/.DS_Store',
    'Procfile',
    'server.js',
    'vendor/**/*',
    '.*/**/*']

  watcher_ignores: ['**/*.sw*', 'node_modules/**/*']
  dump_dirs: ['assets', 'views', 'gen']

  stylus:
    use: [autoprefixer(), rupture()]

options.before = (roots) ->
  ext_path = roots.root + '/assets/extensions'
  gen_path = roots.root + '/gen'
  script_loader_path = gen_path + '/ext_scripts.coffee'

  dir = fs.readdirSync ext_path
  scripts = []
  css_common = []
  css_screen = []
  css_print = []
  for extension in dir
    ext_dir = ext_path + '/' + extension
    if fs.existsSync(ext_dir + '/index.coffee') or fs.existsSync(ext_dir + '/index.js')
      scripts.push extension
    if fs.existsSync(ext_dir + '/common.styl')
      css_common.push extension
    if fs.existsSync(ext_dir + '/screen.styl')
      css_screen.push extension
    if fs.existsSync(ext_dir + '/print.styl')
      css_print.push extension

  if not fs.existsSync gen_path
    fs.mkdirSync gen_path
  script_loader = 'define [\n' +
    scripts.map((x) -> '  \'extensions/'+x+'/index\',\n').join('') +
    '  ], -> arguments\n'
  fs.writeFileSync(script_loader_path, script_loader)
  return false

options.after = (roots) ->
  ext_path = roots.root + '/assets/extensions'
  gen_path = roots.root + '/gen'
  script_loader_path = gen_path + '/ext_scripts.coffee'

  if fs.existsSync script_loader_path
    fs.unlinkSync script_loader_path
  if fs.existsSync gen_path
    fs.rmdirSync gen_path
  return true
