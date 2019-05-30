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
import { getEncryptionKey } from 'libs/realm';
import { changeIotaNode } from 'libs/iota';
import { initialise as initialiseStorage } from 'storage';
import { bugsnagClient, ErrorBoundary } from 'libs/bugsnag';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';
import FatalError from 'ui/global/FatalError';

import { decrypt } from './libs/crypto.js';
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
