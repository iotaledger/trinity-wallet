import { getStoredState } from 'redux-persist';
import { updatePersistedState } from '../libs/utils';
import Errors from '../libs/errors';

export const ActionTypes = {
    SET_ACTIVATION_CODE: 'IOTA/APP/SET_ACTIVATION_CODE',
};

export const migrate = (versions, config, persistor) => (dispatch, getState) => {
    let restoredState = {};
    getStoredState(config)
        .then((persistedState) => {
            restoredState = persistedState;

            if (persistor) {
                return persistor.purge();
            }

            throw new Error(Errors.PERSISTOR_UNDEFINED);
        })
        .then(() => {
            dispatch(resetWallet());
            dispatch(setAppVersions(versions));

            const updatedState = updatePersistedState(getState(), restoredState);

            if (persistor) {
                persistor.rehydrate(updatedState);
            }
        })
        // FIXME: Should be a fallback mechanism here.
        .catch((err) => console.error(err));
};

export const setActivationCode = (code) => ({
    type: ActionTypes.SET_ACTIVATION_CODE,
    payload: code,
});
