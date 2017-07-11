import { combineReducers } from 'redux'
import { firebaseStateReducer } from 'react-redux-firebase'

import tournament from './tournament'
import publish from './publish'

export default combineReducers({
  firebase: firebaseStateReducer,
  tournament,
  publish
})
