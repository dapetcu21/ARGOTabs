module.exports = function (prefix) {
  (prefix != null ? prefix : prefix = '')
  return prefix + Math.floor(Math.random() * 100000000)
}
