import storageSaga from './storage'

export default function * () {
  yield [
    storageSaga()
  ]
}
