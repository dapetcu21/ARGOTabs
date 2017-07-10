export function convertFromLegacy (data) {
  if (!data.version || data.version < 2) {
    return { version: 2, v1: data }
  }
  return data
}

export function getTitle (data) {
  return (!data.version || data.version < 2) ? data.name : data.title
}
