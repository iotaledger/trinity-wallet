import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Provider } from 'react-redux';
import '../shim';
import registerScreens from './navigation';
import i18 from '../i18next';

// Initialization function
// Passed as a callback to persistStore to adjust the rendering time

export default store => {
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
};
