autoprefixer    = require 'autoprefixer-stylus'
rupture         = require 'rupture'
ClientTemplates = require 'client-templates'
CacheManifest   = require 'roots-cache-manifest'
fs              = require 'fs'

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

getPaths = (root) ->
  path =
    ext: root + '/assets/extensions'
    gen: root + '/gen'
  path.script_loader = path.gen + '/ext_scripts.coffee'
  path.css_loader =
    common: path.gen + '/_ext_common.styl',
    screen: path.gen + '/_ext_screen.styl',
    print: path.gen + '/_ext_print.styl',
  path

isFile = (path) ->
  try
    fs.statSync(path).isFile()
  catch
    false

isDir = (path) ->
  try
    fs.statSync(path).isDirectory()
  catch
    false

path = getPaths(__dirname)
dir = fs.readdirSync path.ext
scripts = []
templates = []
css_common = []
css_screen = []
css_print = []
for extension in dir
  ext_dir = path.ext + '/' + extension
  if !isDir(ext_dir)
    continue
  if isFile(ext_dir + '/index.coffee') or isFile(ext_dir + '/index.js')
    scripts.push extension
  if isFile(ext_dir + '/common.styl')
    css_common.push extension
  if isFile(ext_dir + '/screen.styl')
    css_screen.push extension
  if isFile(ext_dir + '/print.styl')
    css_print.push extension
  if isDir(ext_dir + '/templates')
    templates.push extension

for x, i in templates
  options.extensions.push ClientTemplates(
    base: "assets/extensions/"+x+"/templates/"
    pattern: "*.jade"
    out: "extensions/"+x+"/templates.js"
    category: "extensiontemplates" + i
  )

options.before = (roots) ->
  try
    fs.mkdirSync path.gen

  script_loader = 'define [\n' +
    scripts.map((x) -> '  \'extensions/'+x+'/index\',\n').join('') +
    '  ], -> arguments\n'
  fs.writeFileSync(path.script_loader, script_loader)

  writeCss = (files, out_path, suffix) ->
    contents = files.map((x) -> '@import \'../assets/extensions/'+x+'/'+suffix+'\'\n').join('')
    fs.writeFileSync(out_path, contents)

  writeCss css_common, path.css_loader.common, 'common'
  writeCss css_screen, path.css_loader.screen, 'screen'
  writeCss css_print, path.css_loader.print, 'print'
  return

options.after = (roots) ->
  files_to_delete = [
    path.script_loader,
    path.css_loader.common,
    path.css_loader.screen,
    path.css_loader.print
  ]
  for file in files_to_delete
    try
      fs.unlinkSync file
  try
    fs.rmdirSync path.gen
  return
