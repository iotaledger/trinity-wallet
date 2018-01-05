import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Provider } from 'react-redux';
import '../shim';
import registerScreens from './navigation';
import store from '../store';
import i18 from '../i18next';

registerScreens(store, Provider);
translate.setI18n(i18);

Navigation.startSingleScreenApp({
    screen: {
        screen: 'initialLoading',
        navigatorStyle: {
            navBarHidden: true,
            navBarTransparent: true,
        },
        overrideBackPress: true,
    },
    appStyle: {
        orientation: 'portrait',
    },
});

XMLHttpRequest = GLOBAL.originalXMLHttpRequest ? GLOBAL.originalXMLHttpRequest : GLOBAL.XMLHttpRequest;

// fetch logger
global._fetch = fetch;
global.fetch = function(uri, options, ...args) {
    return global._fetch(uri, options, ...args).then(response => {
        console.log('Fetch', { request: { uri, options, ...args }, response });
        return response;
    });
};
