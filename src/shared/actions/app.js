import noop from 'lodash/noop';
import { getStoredState, purgeStoredState } from 'redux-persist';
import { updatePersistedState } from '../libs/util';

export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
    WALLET_LOGOUT: 'IOTA/APP/WALLET/LOGOUT',
    WALLET_RESET: 'IOTA/APP/WALLET/RESET',
    SET_VERSIONS: 'IOTA/APP/WALLET/SET_VERSIONS',
};

export const setAppVersions = payload => ({
    type: ActionTypes.SET_VERSIONS,
    payload,
});

export function setOnboardingCompletionStatus(isCompleted = false) {
    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETED,
        payload: isCompleted,
    };
}

export function logoutFromWallet() {
    return {
        type: ActionTypes.WALLET_LOGOUT,
    };
}

export function resetWallet() {
    return {
        type: ActionTypes.WALLET_RESET,
    };
}

export const migrate = (versions, config, persistor) => (dispatch, getState) => {
    let restoredState = {};
    console.log('Gonna login');
    getStoredState(config)
        .then(persistedState => {
            console.log('Persisted state', persistedState);
            restoredState = persistedState;

            if (persistor) {
                console.log('Purging');
                return persistor.purge();
            }

            throw new Error('persistor not defined.');
        })
        .then(() => {
            console.log('Before', getState());
            dispatch(resetWallet());
            console.log('After', getState());
            dispatch(setAppVersions(versions));

            const updatedState = updatePersistedState(getState(), restoredState);
            persistor.rehydrate(updatedState);
        })
        .catch(err => console.error(err));
};
