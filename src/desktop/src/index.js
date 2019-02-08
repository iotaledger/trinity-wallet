/* global Electron */
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import bugsnag from 'bugsnag-js';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { MemoryRouter as Router } from 'react-router';
import i18next from 'libs/i18next';
import store from 'store';
import { assignAccountIndexIfNecessary } from 'actions/accounts';
import { mapStorageToState as mapStorageToStateAction } from 'actions/wallet';
import { mapStorageToState } from 'libs/storageToStateMappers';
import persistElectronStorage from 'libs/storage';
import { getEncryptionKey } from 'libs/realm';
import { changeIotaNode } from 'libs/iota';
import { parse } from 'libs/utils';
import { initialise as initialiseStorage, realm } from 'storage';
import createPlugin from 'bugsnag-react';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';

import settings from '../package.json';

export const bugsnagClient = bugsnag({
    apiKey: 'fakeAPIkey',
    appVersion: settings.version,
    interactionBreadcrumbsEnabled: false,
    collectUserIp: false,
    user: { id: Electron.getUuid() },
});

const ErrorBoundary = bugsnagClient.use(createPlugin(React));

initialiseStorage(getEncryptionKey)
    .then(() => {
        return new Promise((resolve, reject) => {
            persistElectronStorage.getAllKeys((err, keys) => (err ? reject(err) : resolve(keys)));
        });
    })
    .then((keys) => {
        const getItemAsync = (key) =>
            new Promise((resolve, reject) => {
                persistElectronStorage.getItem(key, (err, item) => (err ? reject(err) : resolve(item)));
            });

        return keys.reduce(
            (promise, key) =>
                promise.then((result) =>
                    getItemAsync(key).then((item) => {
                        result[key.split(':')[1]] = parse(item);

                        return result;
                    }),
                ),
            Promise.resolve({}),
        );
    })
    .then((oldPersistedData) => {
        // TODO: Also check version & completedMigration state prop
        const hasDataToMigrate = !isEmpty(oldPersistedData);

        // Get persisted data from Realm storage
        const persistedDataFromRealm = mapStorageToState();
        const data = hasDataToMigrate ? oldPersistedData : persistedDataFromRealm;

        // Change provider on global iota instance
        const node = get(data, 'settings.node');
        changeIotaNode(node);

        // Update store with persisted state
        store.dispatch(mapStorageToStateAction(data));

        // Assign accountIndex to every account in accountInfo if it is not assigned already
        store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));

        if (Electron.mode === 'tray') {
            // Add Realm change listener to sync read-only Tray app with Main app
            realm.addListener('change', () => {
                const data = mapStorageToState();
                store.dispatch(mapStorageToStateAction(data));
            });
        } else {
            // Start Tray application if enabled in settings
            const isTrayEnabled = get(data, 'settings.isTrayEnabled');
            Electron.setTray(isTrayEnabled);
        }

        render(
            <ErrorBoundary>
                <Redux store={store}>
                    <I18nextProvider i18n={i18next}>
                        <Router>
                            {Electron.mode === 'tray' ? (
                                <Tray />
                            ) : (
                                <React.Fragment>
                                    <Alerts />
                                    <Index />
                                </React.Fragment>
                            )}
                        </Router>
                    </I18nextProvider>
                </Redux>
            </ErrorBoundary>,
            document.getElementById('root'),
        );
    });
