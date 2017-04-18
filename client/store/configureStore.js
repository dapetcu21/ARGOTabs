import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { reactReduxFirebase } from 'react-redux-firebase'
import rootReducer from '../reducers'
import rootSaga from '../sagas'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_DATABASE}.firebaseio.com`,
  storageBucket: `gs://${process.env.FIREBASE_STORAGE_BUCKET}.appspot.com`
}

const reduxFirebaseConfig = {
  userProfile: 'users',
  enableLogging: false
}

export default function configureStore (initialState) {
  const sagaMiddleware = createSagaMiddleware()

  const createStoreWithMiddleware = compose(
    reactReduxFirebase(firebaseConfig, reduxFirebaseConfig),
    applyMiddleware(sagaMiddleware),
    __DEV__ && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  )(createStore)

  const store = createStoreWithMiddleware(rootReducer, initialState)
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default
      store.replaceReducer(nextReducer)
    })
  }

  sagaMiddleware.run(rootSaga)

  return store
}
