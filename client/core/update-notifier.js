function cacheUpdated () {
  var div = document.createElement('div')
  div.className = 'update-notification'
  div.innerHTML = 'Tabs has been updated to a new version. Click here to reload and start using it'
  div.onclick = function () {
    window.location.reload()
  }
  document.body.appendChild(div)
}

if (window.applicationCache) {
  window.applicationCache.addEventListener('updateready', function () {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      cacheUpdated()
    }
  })
}
