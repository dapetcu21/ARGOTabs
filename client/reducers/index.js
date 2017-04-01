import { combineReducers } from 'redux'
import { firebaseStateReducer } from 'react-redux-firebase'

export default combineReducers({
  firebase: firebaseStateReducer
})
