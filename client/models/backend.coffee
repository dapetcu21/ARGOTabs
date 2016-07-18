define ['./backends/index', 'lodash', './backend_import'], (backends, _, Backend) ->
  Backend.backends = _.map backends, (b) -> new b
  return Backend
