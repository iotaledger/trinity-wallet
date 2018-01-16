import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import pickBy from 'lodash/pickBy';
import { persistStore, getStoredState, purgeStoredState, createPersistor } from 'redux-persist';
import { setAppVersions } from './actions/app';

const persistState = (state, config, cb) =>
    persistStore(state, config, () => {
        if (isFunction(cb)) {
            cb(state);
        }
    });

const updateSafely = (incomingState, restoredState, blacklist) => {
    const { app: { versions } } = incomingState;

    // Start by keeping all reducers that are blacklisted
    const relevantIncomingState = pickBy(incomingState, (v, k) => blacklist.indexOf(k) > -1);

    // Always keep the latest version
    const latestRestoredState = merge({}, restoredState, { app: { versions } });

    return merge({}, relevantIncomingState, latestRestoredState);
};

const purgeBeforePersist = (restoredState, state, config, cb) =>
    purgeStoredState({ storage: config.storage })
        .then(() => {
            const incomingState = state.getState();

            const updatedState = updateSafely(incomingState, restoredState, config.blacklist);

            const persistor = createPersistor(state, config);
            persistor.rehydrate(updatedState);

            return persistState(state, config, cb);
        })
        .catch(() => persistState(state, config, cb));

export const migrateBeforePersist = (state, config, versions, cb) =>
    getStoredState(config, (err, restoredState) => {
        state.dispatch(setAppVersions(versions));

        // Fresh install
        if (isEmpty(restoredState)) {
            return persistState(state, config, cb);
        }

        const { app } = state.getState();

        const restoredVersion = get(restoredState, 'app.versions.version');
        const restoredBuildNumber = get(restoredState, 'app.versions.buildNumber');

        const incomingVersion = get(app, 'versions.version');
        const incomingBuildNumber = get(app, 'versions.buildNumber');
        const hasAnUpdate = restoredVersion !== incomingVersion || restoredBuildNumber !== incomingBuildNumber;

        return hasAnUpdate ? purgeBeforePersist(restoredState, state, config, cb) : persistState(state, config, cb);
    });
