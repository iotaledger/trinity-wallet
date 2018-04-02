import get from 'lodash/get';
import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Text, TextInput } from 'react-native';
import { Provider } from 'react-redux';
import { setRandomlySelectedNode } from 'iota-wallet-shared-modules/actions/settings';
import { changeIotaNode, getRandomNode } from 'iota-wallet-shared-modules/libs/iota';
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
                drawUnderStatusBar: true,
                statusBarColor: state.settings.theme.body.bg,
                screenBackgroundColor: state.settings.theme.body.bg,
            },
            overrideBackPress: true,
        },
        appStyle: {
            orientation: 'portrait',
            keepStyleAcrossPush: true,
        },
    });
};

export const setRandomIotaNode = (store) => {
    const { settings } = store.getState();
    const hasAlreadyRandomized = get(settings, 'hasRandomizedNode');

    // Update provider
    changeIotaNode(get(settings, 'node'));

    if (!hasAlreadyRandomized) {
        const node = getRandomNode();
        changeIotaNode(node);
        store.dispatch(setRandomlySelectedNode(node));
    }
};

// Initialization function
// Passed as a callback to persistStore to adjust the rendering time
export default (store) => {
    registerScreens(store, Provider);
    translate.setI18n(i18);

    setRandomIotaNode(store);
    renderInitialScreen(store);
};
