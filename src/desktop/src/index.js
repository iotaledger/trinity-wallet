/* global Electron */
import get from 'lodash/get';
import bugsnag from 'bugsnag-js';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { MemoryRouter as Router } from 'react-router';
import i18next from 'libs/i18next';
import store, { persistStore } from 'store';
import persistElectronStorage from 'libs/storage';
import { changeIotaNode } from 'libs/iota';
import createPlugin from 'bugsnag-react';

import themes from 'themes/themes';

import Index from 'ui/Index';
import Tray from 'ui/Tray';

import Alerts from 'ui/global/Alerts';

import settings from '../package.json';

export const bugsnagClient = bugsnag({
    apiKey: 'fakeAPIkey',
    appVersion: settings.version,
    interactionBreadcrumbsEnabled: false,
    collectUserIp: false,
    beforeSend: async (report) => {
        const uuid = await Electron.getUuid();
        report.user = { id: uuid };
    },
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

const persistor = persistStore(store, persistConfig, (err, restoredState) => {
    const node = get(restoredState, 'settings.node');
    const bgColor = get(restoredState, 'settings.theme.body.bg');

    if (node) {
        changeIotaNode(node);
    }

    if (bgColor) {
        document.body.style.background = bgColor;
    } else {
        document.body.style.background = themes.Default.body.bg;
    }
});

if (Electron.mode === 'tray') {
    Electron.onEvent('storage.update', (payload) => {
        const data = JSON.parse(payload);
        const statePartial = {};
        statePartial[data.key.replace('reduxPersist:', '')] = data.item;
        persistor.rehydrate(statePartial, { serial: true });
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
