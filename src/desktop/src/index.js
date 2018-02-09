import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as Redux } from 'react-redux';
import { MemoryRouter as Router } from 'react-router';
import i18next from 'libs/i18next';
import store from 'store';

import Index from 'ui/Index';

render(
    <Redux store={store}>
        <I18nextProvider i18n={i18next}>
            <Router>
                <Index />
            </Router>
        </I18nextProvider>
    </Redux>,
    document.getElementById('root'),
);
