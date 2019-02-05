/* global Electron */
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import bugsnag from 'bugsnag-js';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import i18next from 'libs/i18next';
import store, { persistStore } from 'store';
import { assignAccountIndexIfNecessary } from 'actions/accounts';
import { setAppVersions, reinitialiseNodesList } from 'actions/settings';
import persistElectronStorage from 'libs/storage';
import { changeIotaNode } from 'libs/iota';
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

const persistConfig =
    Electron.mode === 'tray'
        ? {
              storage: persistElectronStorage,
              whitelist: [],
          }
        : {
              storage: persistElectronStorage,
              blacklist: ['wallet', 'polling', 'ui'],
          };

const persistor = persistStore(store, persistConfig, (_, restoredState) => {
    // Set app versions in store
    store.dispatch(setAppVersions({ version: settings.version }));

    const node = get(restoredState, 'settings.node');

    if (node) {
        changeIotaNode(node);
    }

    // Assign accountIndex to every account in accountInfo if it is not assigned already
    store.dispatch(assignAccountIndexIfNecessary(get(restoredState, 'accounts.accountInfo')));

    const previousAppVersion = get(restoredState, 'settings.versions.version');

    if (
        // Versions < 0.4.5 do not store app versions in redux store
        isUndefined(previousAppVersion) ||
        Number(previousAppVersion) < Number(settings.version)
    ) {
        migrate(settings.version);
    }
});

/**
 * Migrates state
 *
 * @method migrate
 * @param {string} latestVersion
 */
const migrate = (latestVersion) => {
    if (latestVersion === '0.4.5') {
        store.dispatch(reinitialiseNodesList());
    }
};

if (Electron.mode === 'tray') {
    Electron.onEvent('storage.update', (payload) => {
        const data = JSON.parse(payload);
        const statePartial = {};
        statePartial[data.key.replace('reduxPersist:', '')] = data.item;
        persistor.rehydrate(statePartial, { serial: true });
    });
}

const rootEl = document.createElement('div');
rootEl.id = 'root';
document.body.appendChild(rootEl);

const modalEl = document.createElement('div');
modalEl.id = 'modal';
document.body.appendChild(modalEl);

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
    rootEl,
);
