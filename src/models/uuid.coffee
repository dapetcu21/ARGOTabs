define ->
  (prefix) ->
    prefix ?= ''
    prefix + Math.floor(Math.random() * 100000000)
