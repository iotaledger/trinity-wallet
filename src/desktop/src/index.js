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
import { getEncryptionKey } from 'libs/realm';
import { changeIotaNode } from 'libs/iota';
import { initialise as initialiseStorage } from 'storage';
import createPlugin from 'bugsnag-react';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';

import settings from '../package.json';
import { decrypt } from './libs/crypto.js';

export const bugsnagClient = bugsnag({
    apiKey: 'fakeAPIkey',
    appVersion: settings.version,
    interactionBreadcrumbsEnabled: false,
    collectUserIp: false,
    user: { id: Electron.getUuid() },
});

const ErrorBoundary = bugsnagClient.use(createPlugin(React));

if (Electron.mode === 'tray') {
    Electron.onEvent('store.update', (payload) => {
        const data = JSON.parse(payload);
        store.dispatch(mapStorageToStateAction(data));
    });
} else {
    initialiseStorage(getEncryptionKey)
        .then(async (key) => {
            const persistedData = Electron.getStorage('__STATE__');

            if (!persistedData) {
                return null;
            }

            const data = await decrypt(persistedData, key);

            return JSON.parse(data);
        })
        .then((data) => {
            if (!isEmpty(data)) {
                // Change provider on global iota instance
                const node = get(data, 'settings.node');
                changeIotaNode(node);

                // Update store with persisted state
                store.dispatch(mapStorageToStateAction(data));

                // Assign accountIndex to every account in accountInfo if it is not assigned already
                store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));
            }

            // Show Wallet window after inital store update
            Electron.focus();
        })
        .catch((err) => {
            Electron.focus();
        });
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
