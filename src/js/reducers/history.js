// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

//import update from 'react/lib/update';
import { DASHBOARD_LAYOUT, HISTORY_DATE, HISTORY_LOAD } from '../actions';

const initialState = {
  date: Date(),
  time: "07:40:04",
  graphicSize: 'medium',
  legendPlacement: 'right',
  test: 'test1',
  skip: -1,
  history: {
  }
};

const handlers = {
  [DASHBOARD_LAYOUT]: (state, action) => {
    return {
      graphicSize: action.graphicSize
    };
  },

  [HISTORY_DATE]: (state, action) => {
    return {
      date: action.date
    };
  },

  [HISTORY_LOAD]: (state, action) => {
/*    let history = update(state.history, {
     watcher: { $set: action.watcher },
     result: { $set: action.result }
     });*/

    let history = {
      watcher: action.watcher,
      result: action.result
    };

    return {history};
  }
};

export default function dashboardReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
};
