/* global Electron */
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import i18next from 'libs/i18next';
import store from 'store';
import { assignAccountIndexIfNecessary } from 'actions/accounts';
import { mapStorageToState as mapStorageToStateAction } from 'actions/wallet';
import { mapStorageToState } from 'libs/storageToStateMappers';
import { getEncryptionKey } from 'libs/realm';
import { changeIotaNode } from 'libs/iota';
import { bugsnagClient, ErrorBoundary } from 'libs/Bugsnag';
import { initialise as initialiseStorage, realm } from 'storage';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';
import FatalError from 'ui/global/FatalError';

import './ui/index.scss';

const init = () => {
    if (typeof Electron === 'undefined') {
        return render(<FatalError error="Failed to load Electron preload script" />, document.getElementById('root'));
    }

    if (Electron.mode === 'tray') {
        Electron.onEvent('store.update', (payload) => {
            const data = JSON.parse(payload);
            store.dispatch(mapStorageToStateAction(data));
        });
    } else {
        initialiseStorage(getEncryptionKey)
            .then(() => {
                const oldPersistedData = Electron.getAllStorage();
                const hasDataToMigrate = !isEmpty(oldPersistedData);

                if (hasDataToMigrate) {
                    Object.assign(oldPersistedData.settings, {
                        completedMigration: false,
                    });
                }

                // Get persisted data from Realm storage if no old persisted data present
                const data = hasDataToMigrate ? oldPersistedData : mapStorageToState();

                // Change provider on global iota instance
                const node = get(data, 'settings.node');
                changeIotaNode(node);

                // Update store with persisted state
                store.dispatch(mapStorageToStateAction(data));

                // Assign accountIndex to every account in accountInfo if it is not assigned already
                store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));

                // Proxy realm changes to Tray application
                realm.addListener('change', () => {
                    const data = mapStorageToState();
                    Electron.storeUpdate(JSON.stringify(data));
                });

                // Start Tray application if enabled in settings
                const isTrayEnabled = get(data, 'settings.isTrayEnabled');
                Electron.setTray(isTrayEnabled);

                // Show Wallet window after inital store update
                Electron.focus();
            })

            .catch((err) => {
                Electron.focus();
                render(<FatalError error={err.message || err} />, document.getElementById('root'));
                bugsnagClient.notify(err);
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
};

init();
