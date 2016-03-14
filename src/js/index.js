// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import 'index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import Rest from 'grommet/utils/Rest';
import RestWatch from './RestWatch';
import Routes from './Routes';
import { Provider } from 'react-redux';

import store from './store';
import { navItemActivate } from './actions';
import history from './RouteHistory';

// The port number needs to align with devServerProxy and websocketHost in gulpfile.js
//let hostName = 'localhost:8041';
let hostName = '192.168.100.21:8041';

RestWatch.initialize('ws://' + hostName + '/rest/ws');

Rest.setHeaders({
  'Accept': 'application/json',
  'X-API-Version': 200
});

let element = document.getElementById('content');

let onRouteUpdate = () => {
  store.dispatch(navItemActivate(window.location.pathname));
};

ReactDOM.render((
    <Provider store={store}>
      <Router onUpdate={onRouteUpdate}
        routes={Routes.routes} history={history} />
    </Provider>
), element);

document.body.classList.remove('loading');
