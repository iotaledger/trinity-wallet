import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { Navigation } from 'react-native-navigation';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { withNamespaces } from 'react-i18next';
import Realm from 'realm';
import { Text, TextInput, NetInfo, YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import { changeIotaNode, SwitchingConfig } from 'shared-modules/libs/iota';
import reduxStore from 'shared-modules/store';
import iotaNativeBindings, { overrideAsyncTransactionObject } from 'shared-modules/libs/iota/nativeBindings';
import { fetchNodeList as fetchNodes } from 'shared-modules/actions/polling';
import { setCompletedForcedPasswordUpdate, setAppVersions } from 'shared-modules/actions/settings';
import Themes from 'shared-modules/themes/themes';
import { ActionTypes, mapStorageToState as mapStorageToStateAction } from 'shared-modules/actions/wallet';
import { setMigrationStatus } from 'shared-modules/actions/migrations';
import i18next from 'shared-modules/libs/i18next';
import axios from 'axios';
import { getLocaleFromLabel } from 'shared-modules/libs/i18n';
import { clearKeychain } from 'libs/keychain';
import { getDigestFn } from 'libs/nativeModules';
import { resetIfKeychainIsEmpty, reduxPersistStorageAdapter } from 'libs/store';
import registerScreens from 'ui/routes/navigation';
import { initialise as initialiseStorage } from 'shared-modules/storage';
import { mapStorageToState } from 'shared-modules/libs/storageToStateMappers';

// Assign Realm to global RN variable
global.Realm = Realm;

const launch = () => {
    // Disable auto node switching.
    SwitchingConfig.autoSwitch = false;

    // Disable accessibility fonts
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps.allowFontScaling = false;

    // Ignore specific warnings
    YellowBox.ignoreWarnings(['Setting a timer', 'Breadcrumb', 'main queue setup', 'Share was not exported']);

    const state = reduxStore.getState();

    // Clear keychain if onboarding is not complete
    if (!state.accounts.onboardingComplete) {
        clearKeychain();
        reduxStore.dispatch(setCompletedForcedPasswordUpdate());
    }

    // Set default language
    i18next.changeLanguage(getLocaleFromLabel(state.settings.language));

    // FIXME: Temporarily needed for password migration
    const updatedState = reduxStore.getState();

    const navigateToForceChangePassword =
        updatedState.settings.versions.version === '0.5.0' && !updatedState.settings.completedForcedPasswordUpdate;

    // Select initial screen
    const initialScreen = state.accounts.onboardingComplete
        ? navigateToForceChangePassword ? 'forceChangePassword' : 'login'
        : 'languageSetup';

    renderInitialScreen(initialScreen, state);
};

const onAppStart = () => {
    registerScreens(reduxStore, Provider);
    return new Promise((resolve) => Navigation.events().registerAppLaunchedListener(resolve));
};

const renderInitialScreen = (initialScreen, state) => {
    const theme = Themes[state.settings.themeName] || Themes.Default;

    Navigation.setRoot({
        root: {
            stack: {
                id: 'appStack',
                children: [
                    {
                        component: {
                            name: initialScreen,
                            options: {
                                layout: {
                                    backgroundColor: theme.body.bg,
                                    orientation: ['portrait'],
                                },
                                topBar: {
                                    visible: false,
                                    drawBehind: true,
                                    elevation: 0,
                                    background: {
                                        color: theme.body.bg,
                                    },
                                },
                                statusBar: {
                                    drawBehind: true,
                                    backgroundColor: theme.body.bg,
                                },
                            },
                        },
                    },
                ],
            },
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
const hasConnection = (
    url,
    options = { fallbackUrl1: 'https://www.google.com', fallbackUrl2: 'https://www.sogou.com' },
) => {
    return NetInfo.getConnectionInfo().then(() =>
        axios
            .get(url, { timeout: 3000 })
            .then((response) => {
                return response.status === 200;
            })
            .catch(() => {
                if (url !== options.fallbackUrl1 && url !== options.fallbackUrl2) {
                    return hasConnection(options.fallbackUrl1);
                }
                if (url === options.fallbackUrl1) {
                    return hasConnection(options.fallbackUrl2);
                }

                return false;
            }),
    );
};

// Initialise application.
onAppStart()
    //  Initialise persistent storage
    .then(() => initialiseStorage())
    // Restore persistent storage (Map to redux store)
    .then(() => {
        const latestVersions = {
            version: getVersion(),
            buildNumber: Number(getBuildNumber()),
        };

        // Set application version and build number in redux store.
        reduxStore.dispatch(setAppVersions(latestVersions));

        // Get persisted data in AsyncStorage
        return reduxPersistStorageAdapter.get().then((storedData) => {
            const { settings: { versions, completedMigration } } = reduxStore.getState();

            if (
                versions.version === '0.5.2' &&
                completedMigration === false &&
                // Also check if there is persisted data in AsyncStorage that needs to be migrated
                // If this check is omitted, the condition will be satisfied on a fresh install.
                !isEmpty(storedData)
            ) {
                // If a user has stored data in AsyncStorage then map that data to redux store.
                return reduxStore.dispatch(
                    mapStorageToStateAction(merge({}, storedData, { settings: { versions: latestVersions } })),
                );
            }

            // Mark migration as complete since we'll no longer need to migrate data after login
            reduxStore.dispatch(setMigrationStatus(true));

            // Then just map the persisted data from Realm storage to redux store.
            return reduxStore.dispatch(mapStorageToStateAction(mapStorageToState()));
        });
    })
    // Reset persisted state if keychain has no entries
    .then(() => resetIfKeychainIsEmpty(reduxStore))
    // Launch application
    .then(() => {
        overrideAsyncTransactionObject(iotaNativeBindings, getDigestFn());

        const initialize = (isConnected) => {
            reduxStore.dispatch({
                type: ActionTypes.CONNECTION_CHANGED,
                payload: { isConnected },
            });

            // Fetch remote nodes list
            fetchNodeList(reduxStore);
            // Listener callback for connection change event
            startListeningToConnectivityChanges(reduxStore);

            // Register components
            registerScreens(reduxStore, Provider);
            withNamespaces.setI18n(i18next);

            // Render initial screen
            launch();
        };

        hasConnection('https://iota.org').then((isConnected) => initialize(isConnected));
    })
    .catch(noop);
