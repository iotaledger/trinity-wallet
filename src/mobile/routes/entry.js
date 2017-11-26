import '../shim';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import { registerScreens } from './navigation';
import store from '../store';

registerScreens(store, Provider);

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
