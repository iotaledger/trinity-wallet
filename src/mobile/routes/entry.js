import get from 'lodash/get';
import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Provider } from 'react-redux';
import { setRandomlySelectedNode } from 'iota-wallet-shared-modules/actions/settings';
import { changeIotaNode, getRandomNode } from 'iota-wallet-shared-modules/libs/iota';
import registerScreens from './navigation';
import i18 from '../i18next';
import COLORS from '../theme/Colors';

const renderInitialScreen = () => {
    Navigation.startSingleScreenApp({
        screen: {
            screen: 'initialLoading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                drawUnderStatusBar: true,
                statusBarColor: COLORS.backgroundGreen,
                screenBackgroundColor: COLORS.backgroundGreen,
            },
            overrideBackPress: true,
        },
        appStyle: {
            orientation: 'portrait',
            keepStyleAcrossPush: false,
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
    renderInitialScreen();
};
