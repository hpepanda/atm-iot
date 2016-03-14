// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import update from 'react/lib/update';
import RestWatch from '../RestWatch';
import { DASHBOARD_LAYOUT, DASHBOARD_TIMEFRAME, ALERT_LOAD, ALERT_START } from '../actions';

const initialState = {
  timeframe: 12,
  graphicSize: 'medium',
  legendPlacement: 'right',
  alerts: [
    {
      id: 'critical_alerts'
    },
    {
      id: 'atms_alerts'
    }
  ],
  counter: 1,
  critical_alerts : null,
  atms_alerts: null,
  dispatcher: null
};

const handlers = {
  [DASHBOARD_LAYOUT]: (state, action) => {
    return {
      graphicSize: action.graphicSize
    };
  },

  [DASHBOARD_TIMEFRAME]: (state, action) => {
    return {
      timeframe: action.timeframe,
      counter: (state.counter + 1)
    };
  },

  [ALERT_LOAD]: (state, action) => {
    let alerts = state.alerts.map((alert) => {
      if (action.id === alert.id) {
        alert = update(alert, {
          watcher: { $set: action.watcher },
          result: { $set: action.result }
        });
      }
      return alert;
    });

    return {alerts};
  },

  [ALERT_START]: (state, action) => {
    if (!state.critical_alerts) {
      let params = {
        category: "critical_alerts",
        timeframe: action.timeframe
      };

      state.critical_alerts = RestWatch.start('/rest/index/aggregated', params,
        function (result) {
          action.dispatcher(1, state.critical_alerts, result);
        }
      );
    }

    if (!state.atms_alerts) {
      let params = {
        category: "atms_alerts",
        timeframe: action.timeframe
      };

      state.atms_alerts = RestWatch.start('/rest/index/aggregated', params,
        function (result) {
          action.dispatcher(1, state.atms_alerts, result);
        }
      );
    }

    return state;
  }
};

export default function dashboardReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
