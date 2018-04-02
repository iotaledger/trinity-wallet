import get from 'lodash/get';
import bugsnag from 'bugsnag-js';
import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { MemoryRouter as Router } from 'react-router';
import i18next from 'libs/i18next';
import store, { persistStore } from 'store';
import { changeIotaNode } from 'libs/iota';
import createPlugin from 'bugsnag-react';

import Index from 'ui/Index';

export const bugsnagClient = bugsnag({
    apiKey: '53981ba998df346f6377ebbeb1da46d3',
    appVersion: '0.1.1',
    interactionBreadcrumbsEnabled: false,
});
const ErrorBoundary = bugsnagClient.use(createPlugin(React));

const persistConfig = {
    blacklist: ['wallet', 'polling', 'ui', 'seeds', 'deepLinks'],
};

persistStore(store, persistConfig, (err, restoredState) => {
    const node = get(restoredState, 'settings.fullNode');

    if (node) {
        changeIotaNode(node);
    }
});

render(
    <ErrorBoundary>
        <Redux store={store}>
            <I18nextProvider i18n={i18next}>
                <Router>
                    <Index />
                </Router>
            </I18nextProvider>
        </Redux>,
    </ErrorBoundary>,
    document.getElementById('root'),
);
