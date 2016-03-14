// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import RestWatch from './RestWatch';

// nav
export const NAV_ACTIVATE = 'NAV_ACTIVATE';
export const NAV_RESPONSIVE = 'NAV_RESPONSIVE';
export const NAV_ITEM_ACTIVATE = 'NAV_RESPONSIVE';

// dashboard
export const DASHBOARD_LAYOUT = 'DASHBOARD_LAYOUT';
export const DASHBOARD_TIMEFRAME = 'DASHBOARD_TIMEFRAME';

//alert
export const ALERT_START = 'ALERT_START';
export const ALERT_LOAD = 'ALERT_LOAD';
export const ALERT_UNLOAD = 'ALERT_UNLOAD';

//history
export const HISTORY_LOAD = 'HISTORY_LOAD';
export const HISTORY_DATE = 'HISTORY_DATE';

export function navActivate(active) {
  return { type: NAV_ACTIVATE, active: active };
}

export function navResponsive(responsive) {
  return { type: NAV_RESPONSIVE, responsive: responsive };
}

export function navItemActivate(path) {
  return { type: NAV_ITEM_ACTIVATE, path: path };
}

export function dashboardLayout(graphicSize, count) {
  return {
    type: DASHBOARD_LAYOUT,
    graphicSize: graphicSize
  };
}

export function dashboardTimeframe(period) {
  return {
    type: DASHBOARD_TIMEFRAME,
    timeframe: period
  };
}

export function alertLoadSuccess(id, watcher, result) {
  return {
    type: ALERT_LOAD,
    id: id,
    watcher: watcher,
    result: result
  };
}

export function alertsLoad(timeframe) {
  return function (dispatch, getState) {
    getState().dashboard.alerts.forEach((alert) => {
      if (alert.watcher) {
        //RestWatch.stop(alert.watcher);
        alert.watcher = null;
      }

      alert.timeframe = timeframe;
      let params = {
        category: alert.id,
        timeframe: timeframe
      };

      if (!alert.watcher) {
        alert.watcher = RestWatch.start('/rest/index/aggregated', params,
          function (result) {
            dispatch(
              alertLoadSuccess(
                alert.id, alert.watcher, result
              )
            );
          }
        );
      }
    });
  };
/*  return {
    type: ALERT_START,
    timeframe: timeframe,
    dispatcher: alertLoadSuccess
  };*/

  console.log('load alerts for timeframe', timeframe);

 /* return function (dispatch) {
    alerts.forEach((alert) => {
      let params = {
        category: alert.id,
        timeframe: timeframe
      };
      var watcher = RestWatch.start('/rest/index/aggregated', params,
        function (result) {
          dispatch(
            alertLoadSuccess(
              alert.id, watcher, result
            )
          );
        }
      );
    });
  };*/
}

export function alertsUnload(alerts) {
  return function (dispatch) {
    alerts.forEach((alert) => {
      RestWatch.stop(alert.watcher);
      dispatch({ type: ALERT_UNLOAD, alert: alert });
    });
  };
}

export function historyLoadSuccess(id, watcher, result) {
  RestWatch.stop(watcher);
  return {
    type: HISTORY_LOAD,
    id: id,
    watcher: watcher,
    result: result,
    skip: result.skip
  };
}

export function historyLoad(date, skip, atmId) {
  console.log('load history for timeframe');
  return function (dispatch) {
    let params = {
      category: "atms_history_details",
      date: date,
      atmId: atmId,
      skip: skip
    };
    var watcher = RestWatch.start('/rest/index/aggregated', params,
      function (result) {
        dispatch(
          historyLoadSuccess(
            "atms_history_details", watcher, result
          )
        );
      }
    );
  };
}

export function historyDate(date) {
  return {
    type: HISTORY_DATE,
    date: date
  };
}
