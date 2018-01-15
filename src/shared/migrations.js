import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import { persistStore, getStoredState, purgeStoredState } from 'redux-persist';
import { setAppVersions } from './actions/app';

const persistState = (state, config, cb) =>
    persistStore(state, config, () => {
        if (isFunction(cb)) {
            cb(state);
        }
    });

const purgeBeforePersist = (state, config, cb) =>
    purgeStoredState({ storage: config.storage })
        .then(() => persistState(state, config, cb))
        .catch(() => persistState(state, config, cb));

export const migrateBeforePersist = (state, config, versions, cb) =>
    getStoredState(config, (err, restoredState) => {
        state.dispatch(setAppVersions(versions));
        // Fresh install
        if (isEmpty(restoredState)) {
            return persistState(state, config, cb);
        }

        const { app } = state.getState();

        const currentAndroidVersion = get(restoredState, 'app.versions.android');
        const currentIosVersion = get(restoredState, 'app.versions.ios');

        const incomingAndroidVersion = get(app, 'versions.android');
        const incomingIosVersion = get(app, 'versions.ios');
        const hasAppVersions = !isEmpty(currentAndroidVersion) || !isEmpty(currentIosVersion);
        const hasAnUpdate =
            get(currentIosVersion, 'version') !== get(incomingIosVersion, 'version') ||
            get(currentIosVersion, 'buildNumber') !== get(incomingIosVersion, 'buildNumber') ||
            get(currentAndroidVersion, 'version') !== get(incomingAndroidVersion, 'version') ||
            get(currentAndroidVersion, 'buildNumber') !== get(incomingAndroidVersion, 'buildNumber');

        return !hasAppVersions || hasAnUpdate ? purgeBeforePersist(state, config, cb) : persistState(state, config, cb);
    });
