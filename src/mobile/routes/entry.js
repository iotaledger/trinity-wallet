import ntpClient from 'react-native-ntp-client';
import get from 'lodash/get';
import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Text, TextInput, NetInfo } from 'react-native';
import { Provider } from 'react-redux';
import { changeIotaNode, SwitchingConfig } from 'iota-wallet-shared-modules/libs/iota';
import { fetchNodeList as fetchNodes } from 'iota-wallet-shared-modules/actions/polling';
import { ActionTypes } from 'iota-wallet-shared-modules/actions/wallet';
import { getNetworkTimeAsync } from 'iota-wallet-shared-modules/libs/utils';
import i18next from 'i18next';
import { getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { isIOS } from '../utils/device';
import keychain from '../utils/keychain';
import registerScreens from './navigation';
import i18 from '../i18next';

const clearKeychain = () => {
    if (isIOS) {
        keychain.clear().catch((err) => console.error(err)); // eslint-disable-line no-console
    }
};

const renderInitialScreen = (store) => {
    // Disable auto node switching.
    SwitchingConfig.autoSwitch = false;

    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps.allowFontScaling = false;

    // Ignore android warning against timers
    console.ignoredYellowBox = ['Setting a timer']; // eslint-disable-line no-console

    const state = store.getState();

    // Clear keychain if very first load
    if (!state.accounts.onboardingComplete) {
        clearKeychain();
    }

    i18next.changeLanguage(getLocaleFromLabel(state.settings.language));

    const initialScreen = state.accounts.onboardingComplete ? 'login' : 'languageSetup';

    Navigation.startSingleScreenApp({
        screen: {
            screen: initialScreen,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                drawUnderStatusBar: true,
                statusBarColor: '#181818',
                screenBackgroundColor: '#181818',
            },
        },
        appStyle: {
            orientation: 'portrait',
            keepStyleAcrossPush: true,
        },
    });
};

/**
 *  Fetch IRI nodes list from server
 *
 *   @method fetchNodeList
 *   @param {object} store - redux store object
 **/
const fetchNodeList = (store) => {
    const { settings } = store.getState();
    const hasAlreadyRandomized = get(settings, 'hasRandomizedNode');

    // Update provider
    changeIotaNode(get(settings, 'node'));

    store.dispatch(fetchNodes(!hasAlreadyRandomized));
};

/**
 *  Listens to connection changes and updates store on connection change
 *
 *   @method startListeningToConnectivityChanges
 *   @param {object} store - redux store object
 **/
const startListeningToConnectivityChanges = (store) => {
    const checkConnection = (isConnected) => {
        store.dispatch({
            type: ActionTypes.CONNECTION_CHANGED,
            payload: { isConnected },
        });
    };

    NetInfo.isConnected.addEventListener('connectionChange', checkConnection);
};

/**
 *  Determines if device has connection.
 *
 *   @method startListeningToConnectivityChanges
 *   @param {string} url
 *   @param {object} options
 *
 *   @returns {Promise}
 **/
const hasConnection = (url, options = { fallbackUrl: 'https://www.baidu.com' }) => {
    return NetInfo.getConnectionInfo().then(() =>
        fetch(url, { timeout: 3000 })
            .then((response) => response.status === 200)
            .catch(() => {
                if (url !== options.fallbackUrl) {
                    return hasConnection(options.fallbackUrl);
                }

                return false;
            }),
    );
};

// Initialization function
// Passed as a callback to persistStore to adjust the rendering time
export default (store) => {
    const initialize = (isConnected) => {
        store.dispatch({
            type: ActionTypes.CONNECTION_CHANGED,
            payload: { isConnected },
        });
        fetchNodeList(store);
        startListeningToConnectivityChanges(store);

        registerScreens(store, Provider);
        translate.setI18n(i18);

        renderInitialScreen(store);
    };

    hasConnection('https://www.google.com').then((isConnected) => {
        const localTime = new Date().getTime();

        // Verify whether the network call failed
        // because of an out of sync clock
        if (!isConnected) {
            getNetworkTimeAsync(ntpClient)
                .then((date) => {
                    const networkTime = date.getTime();
                    const diff = networkTime - localTime;

                    initialize(Math.floor(diff / 3600000) >= 1);
                })
                .catch(() => initialize(isConnected));
        } else {
            initialize(isConnected);
        }
    });
};
