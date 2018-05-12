import includes from 'lodash/includes';

const alertsMiddleware = (store) => (next) => (action) => {
    if (includes(action.type, 'ALERTS/SHOW') || includes(action.type, 'ALERTS/HIDE')) {
        // Only dispatch new alerts if it wallet has a connection
        if (store.getState().wallet.hasConnection) {
            next(action);
        }
    } else {
        next(action);
    }
};

export default alertsMiddleware;
