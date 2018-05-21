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
import { DESKTOP_VERSION } from 'config';

import themes from 'themes/themes';

import Index from 'ui/Index';

import Theme from 'ui/global/Theme';
import Alerts from 'ui/global/Alerts';
import Updates from 'ui/global/Updates';
import Feedback from 'ui/global/Feedback';

export const bugsnagClient = bugsnag({
    apiKey: '53981ba998df346f6377ebbeb1da46d3',
    appVersion: DESKTOP_VERSION,
    interactionBreadcrumbsEnabled: false,
});
const ErrorBoundary = bugsnagClient.use(createPlugin(React));

const persistConfig = {
    storage: persistElectronStorage,
    blacklist: ['wallet', 'polling', 'ui'],
};

persistStore(store, persistConfig, (err, restoredState) => {
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

render(
    <ErrorBoundary>
        <Redux store={store}>
            <I18nextProvider i18n={i18next}>
                <React.Fragment>
                    <Feedback />
                    <Theme />
                    <Alerts />
                    <Updates />
                    <Router>
                        <Index />
                    </Router>
                </React.Fragment>
            </I18nextProvider>
        </Redux>,
    </ErrorBoundary>,
    document.getElementById('root'),
);
