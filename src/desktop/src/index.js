import React from 'react';
import { render } from 'react-dom';
import { Provider as Redux } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18next from './libs/i18next';
import store from './store';
import App from './components/App';

render(
    <Redux store={store}>
        <I18nextProvider i18n={i18next}>
            <App name='IOTA'/>
        </I18nextProvider>
    </Redux>,
    document.getElementById('root')
);
