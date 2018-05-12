import includes from 'lodash/includes';

const modalMiddleware = (store) => (next) => (action) => {
    if (includes(action.type, 'TOGGLE_MODAL_ACTIVITY')) {
        const { wallet, ui } = store.getState();

        if (wallet.hasConnection) {
            next(action);
        } else {
            // Alow modal to close if there is no connection
            if (ui.isModalActive) {
                next(action);
            }
        }
    } else {
        next(action);
    }
};

export default modalMiddleware;
