define ->
  class Backend
    constructor: -> throw new Error("Backend is purely virtual")
    save: -> throw new Error("save(): Not implemented")
    load: -> throw new Error("load(): Not implemented")
    delete: -> throw new Error("delete(): Not implemented")
    rename: -> throw new Error("rename(): Not implemented")
    fileName: -> "(null)"

