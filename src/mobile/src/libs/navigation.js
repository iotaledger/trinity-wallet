import last from 'lodash/last';
import merge from 'lodash/merge';
import { Navigation } from 'react-native-navigation';
import timer from 'react-native-timer';
import { WalletActionTypes } from 'shared-modules/types';
import { getBackgroundColor } from 'ui/theme/general';
import { getThemeFromState } from 'shared-modules/selectors/global';
import store from '../../../shared/store';

const getDefaultOptions = (nextScreen) => {
    return {
        animations: {
            push: {
                enable: false,
            },
            pop: {
                enable: false,
            },
            setStackRoot: {
                enable: false,
            },
        },
        layout: {
            backgroundColor: getBackgroundColor(nextScreen, getThemeFromState(store.getState())),
            orientation: ['portrait'],
        },
    };
};

export const navigator = {
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
        store.dispatch({ type: WalletActionTypes.POP_TO_ROUTE });
        return timer.setTimeout(currentScreen, () => Navigation.popTo(componentId), delay);
    },
    setStackRoot: (nextScreen, options = {}, delay = 300) => {
        const currentScreen = last(store.getState().wallet.navStack);
        store.dispatch({ type: WalletActionTypes.RESET_ROUTE, payload: nextScreen });
        return timer.setTimeout(
            currentScreen,
            () =>
                Navigation.setStackRoot('appStack', {
                    component: {
                        name: nextScreen,
                        id: nextScreen,
                        options: merge({}, options, getDefaultOptions(nextScreen)),
                    },
                }),
            delay,
        );
    },
};
