import get from 'lodash/get';
import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Provider } from 'react-redux';
import { setRandomlySelectedNode } from 'iota-wallet-shared-modules/actions/settings';
import { changeIotaNode, getRandomNode } from 'iota-wallet-shared-modules/libs/iota';
import i18next from 'i18next';
import { getLocaleFromLabel } from 'iota-wallet-shared-modules/libs/i18n';
import { isIOS } from '../util/device';
import keychain from '../util/keychain';
import registerScreens from './navigation';
import i18 from '../i18next';

const clearKeychain = () => {
    if (isIOS) {
        keychain.clear().catch((err) => console.error(err)); // eslint-disable-line no-console
    }
};

const renderInitialScreen = (store) => {
    console.ignoredYellowBox = ['Setting a timer']; // eslint-disable-line no-console
    const state = store.getState();
    if (!state.account.onboardingComplete) {
        clearKeychain();
    }
    i18next.changeLanguage(getLocaleFromLabel(state.settings.language));
    const initialScreen = state.account.onboardingComplete ? 'home' : 'languageSetup';
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
    changeIotaNode(get(settings, 'fullNode'));

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
