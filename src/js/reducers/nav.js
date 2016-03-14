// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { NAV_ACTIVATE, NAV_RESPONSIVE, NAV_ITEM_ACTIVATE } from '../actions';

const initialState = {
  active: false,
  responsive: 'multiple',
  items: [
    {path: '/dashboard', label: 'Dashboard', active: true},
    {path: '/history', label: 'History'}
    //{path: '/analytics', label: 'Analytics'}
  ]
};

const handlers = {
  [NAV_ACTIVATE]: (_, action) => ({
    active: action.active,
    activateOnMultiple: null
  }),
  [NAV_RESPONSIVE]: (state, action) => {
    let result = {responsive: action.responsive};
    if ('single' === action.responsive && state.active) {
      result.active = false;
      result.activateOnMultiple = true;
    } else if ('multiple' === action.responsive && state.activateOnMultiple) {
      result.active = true;
    }
    return result;
  },
  [NAV_ITEM_ACTIVATE]: (state, action) => {
    state.items.map((item) => (action.path === item.path) ?
      item.active = true :
      item.active = undefined
    );
  }
};

export default function navReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
