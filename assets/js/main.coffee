# for more info on require config, see http://requirejs.org/docs/api.html#config
require.config
  baseUrl: '/js'
  paths:
    jquery: '/components/jquery/jquery'
    "jquery.bootstrap": '/components/bootstrap/js/bootstrap'
  shim:
    "jquery.bootstrap": ['jquery']

require ['jquery', 'jquery.bootstrap', 'tournament', 'localbackend'], ($, NULL, Tournament, LocalBackend) ->
  tournament = document.tournament = new Tournament(new LocalBackend("ocompetitie"))
  tournament.load -> console.log 'tournament loaded' + tournament.name

