import assign from 'lodash/assign';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { setNextStepAsActive, reset as resetProgress } from './progress';
import { migrateAccounts, migrateSettings } from '../libs/migrations';
import { mapStorageToState as mapStorageToStateAction } from './wallet';
import { generateAlert } from './alerts';
import { mapStorageToState } from '../libs/storageToStateMappers';
import { Wallet } from '../storage';
import Errors from '../libs/errors';
import i18next from '../libs/i18next.js';

/**
 * Migration action types
 */
export const ActionTypes = {
    SET_REALM_MIGRATION_STATUS: 'IOTA/SETTINGS/SET_REALM_MIGRATION_STATUS',
};

/**
 * Migrates persisted data from old storage to new storage (Realm)
 *
 * @method migrate
 *
 * @param {object} oldStorageAdapter - { get: {Promise}, clear: {Promise} }
 * @returns {function}
 */
export const migrate = (oldStorageAdapter) => (dispatch) => {
    const onComplete = () => {
        // Set latest (migrated) data to redux store
        dispatch(mapStorageToStateAction(mapStorageToState()));

        // Mark migration as complete
        dispatch(setRealmMigrationStatus(true));

        // Reset progress bar
        dispatch(resetProgress());
    };

    // Progressbar => (Preparing data)
    dispatch(setNextStepAsActive());

    return oldStorageAdapter
        .get()
        .then((storedData) => {
            if (isEmpty(storedData)) {
                throw new Error(Errors.NO_STORED_DATA_FOUND);
            }

            // Progressbar => Migrating settings
            dispatch(setNextStepAsActive());

            const settings = get(storedData, 'settings');
            // If user has wallet settings, migrate them.
            if (settings) {
                return migrateSettings(
                    assign({}, settings, {
                        // onboardingComplete is part of accounts reducer (in old storage) and has now moved to Wallet schema model
                        // Assign it to the settings object so that it can be migrated with the rest of the settings.
                        onboardingComplete: get(storedData, 'accounts.onboardingComplete') || false,
                        // notificationLog is part of alerts reducer (in old storage) and has now moved to Wallet schema model
                        // Has also been renamed to errorLog. Assign it to the settings object
                        errorLog: get(storedData, 'alerts.notificationLog') || [],
                    }),
                ).then(() => storedData);
            }

            return Promise.resolve(storedData);
        })
        .then((storedData) => {
            // Progressbar => Migrating accounts
            dispatch(setNextStepAsActive());

            const accounts = get(storedData, 'accounts');
            if (accounts) {
                return migrateAccounts(accounts).then(() => storedData);
            }

            return Promise.resolve(storedData);
        })
        .then(() => {
            // Progressbar => Cleaning old data
            dispatch(setNextStepAsActive());

            return oldStorageAdapter.clear();
        })
        .then(() => {
            // Progressbar => Migration Complete
            dispatch(setNextStepAsActive());

            setTimeout(onComplete, 2000);
        })
        .catch((error) => {
            if (error.message === Errors.NO_STORED_DATA_FOUND) {
                // If there is not data to migrate, just mark migration as complete
                onComplete();
            } else {
                dispatch(resetProgress());
                dispatch(
                    generateAlert(
                        'error',
                        i18next.t('global:somethingWentWrong'),
                        i18next.t('migration:problemMigratingYourData'),
                        5500,
                        error,
                    ),
                );
            }
        });
};

/**
 * Dispatch to set migration (AsyncStorage to Realm) complete
 *
 * @method setRealmMigrationStatus
 * @param {bool} payload
 *  *
 * @returns {{type: {string}, payload: {bool} }}
 */
export const setRealmMigrationStatus = (payload) => {
    Wallet.setRealmMigrationStatus(payload);

    return {
        type: ActionTypes.SET_REALM_MIGRATION_STATUS,
        payload,
    };
};
