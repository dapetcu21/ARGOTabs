import { combineReducers } from 'redux'
import { firebaseStateReducer } from 'react-redux-firebase'

import tournament from './tournament'

export default combineReducers({
  firebase: firebaseStateReducer,
  tournament
})
