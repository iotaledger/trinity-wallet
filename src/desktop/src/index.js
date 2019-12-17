/* global Electron */
import assign from 'lodash/assign';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import i18next, { i18nextInit } from 'libs/i18next';
import store from 'store';
import Themes from 'themes/themes';
import { assignAccountIndexIfNecessary } from 'actions/accounts';
import { updateTheme } from 'actions/settings';
import { mapStorageToState } from 'actions/wallet';
import getEncryptionKey from 'libs/realm';
import { changeIotaNode, quorum } from 'libs/iota';
import { bugsnagClient, ErrorBoundary } from 'libs/bugsnag';
import { updateSchema } from 'schemas';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';
import FatalError from 'ui/global/FatalError';

import { decrypt } from './libs/crypto';
import './ui/index.scss';

const init = () => {
    const rootEl = document.createElement('div');
    rootEl.id = 'root';
    document.body.appendChild(rootEl);

    const modalEl = document.createElement('div');
    modalEl.id = 'modal';
    document.body.appendChild(modalEl);

    const script = document.createElement('script');
    script.src = 'https://cdn.moonpay.io/moonpay-sdk.js';

    document.write(script.outerHTML);

    if (typeof Electron === 'undefined') {
        return render(<FatalError error="Failed to load Electron preload script" />, rootEl);
    }

    if (Electron.mode === 'tray') {
        Electron.onEvent('store.update', (payload) => {
            const data = JSON.parse(payload);
            store.dispatch(mapStorageToState(data));
        });

        const renderTray = async () => {
            // Initialize i18next
            await i18nextInit();

            render(
                <ErrorBoundary>
                    <Redux store={store}>
                        <I18nextProvider i18n={i18next}>
                            <Router>
                                <Tray />
                            </Router>
                        </I18nextProvider>
                    </Redux>
                </ErrorBoundary>,
                rootEl,
            );
        };

        renderTray();
    } else {
        getEncryptionKey()
            .then(async (key) => {
                const persistedData = Electron.getStorage('__STATE__');

                if (!persistedData) {
                    return null;
                }

                const data = await decrypt(persistedData, key);

                return JSON.parse(data);
            })
            .then(async (persistedData) => {
                // Initialize i18next
                await i18nextInit();

                if (!isEmpty(persistedData)) {
                    const data = updateSchema(persistedData);

                    // Change provider on global iota instance
                    const node = get(data, 'settings.node');
                    changeIotaNode(assign({}, node, { provider: node.url }));

                    // Set quorum size
                    quorum.setSize(get(data, 'settings.quorum.size'));

                    // Update store with persisted state
                    store.dispatch(mapStorageToState(data));

                    // Set theme to default if current theme does not exist
                    if (!get(Themes, store.getState().settings.themeName)) {
                        store.dispatch(updateTheme('Default'));
                    }

                    // Update language to initial setting
                    i18next.changeLanguage(data.settings.locale);

                    // Assign accountIndex to every account in accountInfo if it is not assigned already
                    store.dispatch(assignAccountIndexIfNecessary(get(data, 'accounts.accountInfo')));
                }

                render(
                    <ErrorBoundary>
                        <Redux store={store}>
                            <I18nextProvider i18n={i18next}>
                                <Router>
                                    <React.Fragment>
                                        <Alerts />
                                        <Index />
                                    </React.Fragment>
                                </Router>
                            </I18nextProvider>
                        </Redux>
                    </ErrorBoundary>,
                    rootEl,
                );

                // Show Wallet window after inital store update
                Electron.focus();
            })

            .catch((err) => {
                Electron.focus();
                render(<FatalError error={err.message || err} />, rootEl);
                bugsnagClient.notify(err);
            });
    }
};

init();
