import Tournament from '../models/tournament'

export function censor (data) {
  const v1 = new Tournament()
  v1.loadFromModel(data.v1)
  v1.censor()
  return { ...data, v1: JSON.parse(JSON.stringify(v1)) }
}
