import get from 'lodash/get';
import last from 'lodash/last';
import merge from 'lodash/merge';
import { Navigation } from 'react-native-navigation';
import timer from 'react-native-timer';
import { WalletActionTypes } from 'shared-modules/types';
import { getBackgroundColor, getStatusBarStyle, getStatusBarColor } from 'ui/theme/general';
import { getThemeFromState } from 'shared-modules/selectors/global';
import store from '../../../shared/store';

const getDefaultOptions = (nextScreen) => {
    const theme = getThemeFromState(store.getState());
    return {
        animations: {
            push: {
                enabled: false,
            },
            pop: {
                enabled: false,
            },
            setStackRoot: {
                enabled: false,
            },
        },
        layout: {
            backgroundColor: getBackgroundColor(nextScreen, theme),
            orientation: ['portrait'],
        },
        statusBar: {
            style: getStatusBarStyle(getStatusBarColor(nextScreen, theme)).replace('-content', ''),
        },
    };
};

const navigator = {
    push: (nextScreen, options = {}, delay = 300) => {
        const currentScreen = last(store.getState().wallet.navStack);
        store.dispatch({ type: WalletActionTypes.PUSH_ROUTE, payload: nextScreen });

        return timer.setTimeout(
            currentScreen,
            () =>
                Navigation.push('appStack', {
                    component: {
                        name: nextScreen,
                        id: nextScreen,
                        options: merge({}, getDefaultOptions(nextScreen), options),
                    },
                }),
            delay,
        );
    },
    pop: (componentId, delay = 300) => {
        const currentScreen = last(store.getState().wallet.navStack);
        store.dispatch({ type: WalletActionTypes.POP_ROUTE });
        return timer.setTimeout(currentScreen, () => Navigation.pop(componentId), delay);
    },
    popTo: (componentId, delay = 300) => {
        const currentScreen = last(store.getState().wallet.navStack);
        store.dispatch({ type: WalletActionTypes.POP_TO_ROUTE, payload: componentId });
        return timer.setTimeout(currentScreen, () => Navigation.popTo(componentId), delay);
    },
    setStackRoot: (nextScreen, options = {}, delay = 300) => {
        const currentScreen = last(store.getState().wallet.navStack);
        store.dispatch({ type: WalletActionTypes.RESET_ROUTE, payload: nextScreen });

        const passProps = get(options, 'passProps');

        return timer.setTimeout(
            currentScreen,
            () =>
                Navigation.setStackRoot('appStack', {
                    component: {
                        name: nextScreen,
                        id: nextScreen,
                        options: merge({}, options, getDefaultOptions(nextScreen)),
                        passProps,
                    },
                }),
            delay,
        );
    },
};

export default navigator;
