class Source {
  constructor (backend, _url) {
    this.backend = backend
    this._url = _url
  }

  load () {
    throw new Error('load(): Not implemented')
  }

  save () {
    throw new Error('save(): Not implemented')
  }

  delete () {
    throw new Error('delete(): Not implemented')
  }

  rename () {
    throw new Error('rename(): Not implemented')
  }

  canRename () {
    return false
  }

  canSave () {
    return true
  }

  url () {
    return this._url
  }

  exists () {
    return true
  }

  fileName () {
    var url = this.url()

    if (!url) {
      return ''
    }

    var parsed = url.split('/')

    if (!parsed.length) {
      return ''
    }

    return decodeURIComponent(parsed[parsed.length - 1]).replace(/\.atab$/, '')
  }
}

module.exports = Source
