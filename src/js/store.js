// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
//import { devTools } from 'redux-devtools';

// TODO: fix webpack loader to allow import * from './reducers'
import nav from './reducers/nav';
import dashboard from './reducers/dashboard';
import history from './reducers/history';

export default compose(
  applyMiddleware(thunk)
  //devTools()
)(createStore)(combineReducers({ nav, dashboard, history }));
