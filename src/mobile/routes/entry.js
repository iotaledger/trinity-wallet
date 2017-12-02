import '../shim';
import { Navigation } from 'react-native-navigation';
import { translate } from 'react-i18next';
import { Provider } from 'react-redux';
import { registerScreens } from './navigation';
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
            screenBackgroundImageName: 'bg-blue.png',
            screenBackgroundColor: '#102e36',
        },
        overrideBackPress: true,
    },
});
