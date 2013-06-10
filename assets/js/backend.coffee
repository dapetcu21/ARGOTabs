define ->
  class Backend
    constructor: -> throw new Error("Backend is purely virtual")
    save: -> throw new Error("save(): Not implemented")
    load: -> throw new Error("load(): Not implemented")

