// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Indexer from './components/Indexer';
import Dashboard from './components/Dashboard';
import History from './components/History.js';

import TBD from 'grommet/components/TBD';

module.exports = {

  prefix: "/",

  path: (path) => ("/" + path.slice(1)),

  routes: [
    { path: "/", component: Indexer,
      indexRoute: {
        onEnter: function (nextState, replaceState) {
          replaceState(null, '/dashboard');
        }
      },
      childRoutes: [
        { path: 'dashboard', component: Dashboard },
        { path: 'history', component: History },
        { path: 'analytics', component: TBD }
      ]
    }
  ]
};
