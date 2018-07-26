import { getStoredState } from 'redux-persist';
import { updatePersistedState } from '../libs/utils';
import { resetWallet, setAppVersions } from './settings';
import Errors from '../libs/errors';

export const ActionTypes = {
    SET_ACTIVATION_CODE: 'IOTA/APP/SET_ACTIVATION_CODE',
    SET_COMPLETED_FORCED_PASSWORD_UPDATE: 'IOTA/APP/SET_COMPLETED_FORCED_PASSWORD_UPDATE',
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

export const setCompletedForcedPasswordUpdate = () => ({
    type: ActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE,
});
