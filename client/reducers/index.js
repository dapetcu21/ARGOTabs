import { combineReducers } from 'redux'
import { firebaseStateReducer } from 'react-redux-firebase'

import tournamentMeta from './tournamentMeta'
import tournament from './tournament'

export default combineReducers({
  firebase: firebaseStateReducer,
  tournamentMeta,
  tournament
})
