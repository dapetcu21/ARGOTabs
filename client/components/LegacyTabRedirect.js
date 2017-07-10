import React from 'react'
import { Redirect } from 'react-router-dom'

export default function LegacyTabRedirect ({ children, location }) {
  const matches = location.hash.match(/^#\/url\/([^#]+)(\/#(\/.*))?$/)
  if (matches) {
    const url = decodeURIComponent(matches[1])
      .replace('http://argotabdbro.herokuapp.com', 'https://argotabdbro.herokuapp.com')
    const pathname = matches[3] || '/'
    return <Redirect to={`/remote/${encodeURIComponent(url)}${pathname}`} />
  }
  return children
}
