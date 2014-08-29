define ['./backends/index', 'underscore', './backend_import'], (backends, _, Backend) ->
  Backend.backends = _.map backends, (b) -> new b
  return Backend
