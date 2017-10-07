import { ActionTypes } from '../actions/settings.js';

const settingsReducer = (state = {
  locale: 'en',
  fullNode: 'http://node01.iotatoken.nl:14265',
}, action) => {
  switch (action.type) {

    case ActionTypes.SET_LOCALE:
      return {
        ...state,
        locale: action.payload,
      };

    case ActionTypes.SET_FULLNODE:
      return {
        ...state,
        fullNode: action.payload,
      };

  }
  return state;
};

export default settingsReducer;
