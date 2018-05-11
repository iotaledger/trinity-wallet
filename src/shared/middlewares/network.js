import includes from 'lodash/includes';
import { ActionTypes } from '../actions/wallet';
import { ActionTypes as AlertsActionTypes } from '../actions/alerts';

const networkMiddleware = (store) => (next) => (action) => {
  if (
    action.type === ActionTypes.CONNECTION_CHANGED &&
    !action.payload.isConnected
  ) {
    next({
      category: 'error',
      title: 'no network',
      message: 'no connection man.',
      type: AlertsActionTypes.SHOW,
      closeInterval: 100000
    });

    next(action);
  } else if (action.type === ActionTypes.CONNECTION_CHANGED && action.payload.isConnected) {
    next({ type: AlertsActionTypes.HIDE });
    next(action);
  } else {
    next(action);
  }

  if (includes(action.type, 'ALERTS/SHOW')) {
    if (store.getState().wallet.hasConnection) {
      next(action);
    }
  } else {
    next(action);
  }
};

export default networkMiddleware;
