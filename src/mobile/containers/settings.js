import get from 'lodash/get';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import THEMES from '../theme/themes';
import { clearTempData, setPassword, setSetting, setAdditionalAccountInfo } from '../../shared/actions/tempAccount';
import {
    changeAccountName,
    deleteAccount,
    manuallySyncAccount,
    update2FA,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
} from 'iota-wallet-shared-modules/actions/account';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import {
    setFullNode,
    getCurrencyData,
    addCustomPoWNode,
    updateTheme,
    setLanguage,
} from 'iota-wallet-shared-modules/actions/settings';
import whiteModeImagePath from 'iota-wallet-shared-modules/images/mode-white.png';
import whiteThemeImagePath from 'iota-wallet-shared-modules/images/theme-white.png';
import whiteCurrencyImagePath from 'iota-wallet-shared-modules/images/currency-white.png';
import whiteLanguageImagePath from 'iota-wallet-shared-modules/images/language-white.png';
import whiteAccountImagePath from 'iota-wallet-shared-modules/images/account-white.png';
import whiteTwoFactorAuthImagePath from 'iota-wallet-shared-modules/images/2fa-white.png';
import whitePasswordImagePath from 'iota-wallet-shared-modules/images/password-white.png';
import whiteAdvancedImagePath from 'iota-wallet-shared-modules/images/advanced-white.png';
import whiteLogoutImagePath from 'iota-wallet-shared-modules/images/logout-white.png';
import blackModeImagePath from 'iota-wallet-shared-modules/images/mode-black.png';
import blackThemeImagePath from 'iota-wallet-shared-modules/images/theme-black.png';
import blackCurrencyImagePath from 'iota-wallet-shared-modules/images/currency-black.png';
import blackLanguageImagePath from 'iota-wallet-shared-modules/images/language-black.png';
import blackAccountImagePath from 'iota-wallet-shared-modules/images/account-black.png';
import blackTwoFactorAuthImagePath from 'iota-wallet-shared-modules/images/2fa-black.png';
import blackPasswordImagePath from 'iota-wallet-shared-modules/images/password-black.png';
import blackAdvancedImagePath from 'iota-wallet-shared-modules/images/advanced-black.png';
import blackLogoutImagePath from 'iota-wallet-shared-modules/images/logout-black.png';
import whiteArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-white.png';
import blackArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-black.png';
import whiteTickImagePath from 'iota-wallet-shared-modules/images/tick-white.png';
import blackTickImagePath from 'iota-wallet-shared-modules/images/tick-black.png';
import whiteKeyImagePath from 'iota-wallet-shared-modules/images/key-white.png';
import blackKeyImagePath from 'iota-wallet-shared-modules/images/key-black.png';
import whiteAddImagePath from 'iota-wallet-shared-modules/images/add-white.png';
import blackAddImagePath from 'iota-wallet-shared-modules/images/add-black.png';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { renameKeys, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import { changeIotaNode, checkNode } from 'iota-wallet-shared-modules/libs/iota';
import KeepAwake from 'react-native-keep-awake';
import LogoutConfirmationModal from '../components/logoutConfirmationModal';
import SettingsContent from '../components/settingsContent';
import keychain, {
    hasDuplicateAccountName,
    hasDuplicateSeed,
    getSeed,
    updateAccountNameInKeychain,
    deleteFromKeychain,
} from '../util/keychain';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    settingsContainer: {
        flex: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1,
        paddingVertical: height / 40,
    },
    advancedSettingsContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    modalContent: {
        justifyContent: 'center',
    },
    dropdownTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
});

class Settings extends Component {
    static propTypes = {
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
        navigator: PropTypes.object.isRequired,
        accountInfo: PropTypes.object.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        currentSetting: PropTypes.string.isRequired,
        seedIndex: PropTypes.number.isRequired,
        password: PropTypes.string.isRequired,
        seedNames: PropTypes.array.isRequired,
        seedCount: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
        mode: PropTypes.string.isRequired,
        availableCurrencies: PropTypes.array.isRequired,
        fullNode: PropTypes.string.isRequired,
        availablePoWNodes: PropTypes.array.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        t: PropTypes.func.isRequired,
        manuallySyncAccount: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        changeAccountName: PropTypes.func.isRequired,
        deleteAccount: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
        addCustomPoWNode: PropTypes.func.isRequired,
        updateTheme: PropTypes.func.isRequired,
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        themeName: PropTypes.string.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        barColor: PropTypes.object.isRequired,
        ctaColor: PropTypes.object.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
        positiveColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        extraColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        isFingerprintEnabled: PropTypes.bool.isRequired,
        is2FAEnabled: PropTypes.bool.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        setLanguage: PropTypes.func.isRequired,
        language: PropTypes.string.isRequired,
        secondaryBarColor: PropTypes.string.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        transitionForSnapshot: PropTypes.func.isRequired,
        transitionBalance: PropTypes.number.isRequired,
        transitionAddresses: PropTypes.array.isRequired,
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        balanceCheckToggle: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isFetchingAccountInfo: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            modalSetting: 'addNewSeed',
            modalContent: <LogoutConfirmationModal />,
        };
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isSyncing && newProps.isSyncing) {
            KeepAwake.activate();
        } else if (this.props.isSyncing && !newProps.isSyncing) {
            KeepAwake.deactivate();
        }
    }

    getChildrenProps(child) {
        const {
            secondaryBackgroundColor,
            negativeColor,
            ctaColor,
            positiveColor,
            barColor,
            backgroundColor,
            extraColor,
            ctaBorderColor,
            secondaryCtaColor,
            language,
            secondaryBarColor,
            selectedAccountName,
            seedIndex,
            transitionBalance,
            transitionAddresses,
            balanceCheckToggle,
            isTransitioning,
            selectedAccount,
            transitionForSnapshot,
            generateAddressesAndGetBalance,
            completeSnapshotTransition,
        } = this.props;
        const isWhite = secondaryBackgroundColor === 'white';
        const arrowLeftImagePath = isWhite ? whiteArrowLeftImagePath : blackArrowLeftImagePath;
        const tickImagePath = isWhite ? whiteTickImagePath : blackTickImagePath;
        const modeImagePath = isWhite ? whiteModeImagePath : blackModeImagePath;
        const themeImagePath = isWhite ? whiteThemeImagePath : blackThemeImagePath;
        const currencyImagePath = isWhite ? whiteCurrencyImagePath : blackCurrencyImagePath;
        const languageImagePath = isWhite ? whiteLanguageImagePath : blackLanguageImagePath;
        const accountImagePath = isWhite ? whiteAccountImagePath : blackAccountImagePath;
        const passwordImagePath = isWhite ? whitePasswordImagePath : blackPasswordImagePath;
        const twoFactorAuthImagePath = isWhite ? whiteTwoFactorAuthImagePath : blackTwoFactorAuthImagePath;
        const advancedImagePath = isWhite ? whiteAdvancedImagePath : blackAdvancedImagePath;
        const logoutImagePath = isWhite ? whiteLogoutImagePath : blackLogoutImagePath;
        const keyImagePath = isWhite ? whiteKeyImagePath : blackKeyImagePath;
        const addImagePath = isWhite ? whiteAddImagePath : blackAddImagePath;

        const props = {
            mainSettings: {
                t: this.props.t,
                setSetting: setting => this.props.setSetting(setting),
                setModalContent: content => this.setModalContent(content),
                onThemePress: () => this.props.setSetting('themeCustomisation'),
                onModePress: () => this.featureUnavailable(),
                mode: this.props.mode,
                onLanguagePress: () => this.props.setSetting('languageSelection'),
                themeName: this.props.themeName,
                currency: this.props.currency,
                borderBottomColor: { borderBottomColor: secondaryBackgroundColor },
                textColor: { color: secondaryBackgroundColor },
                modeImagePath,
                themeImagePath,
                currencyImagePath,
                languageImagePath,
                accountImagePath,
                passwordImagePath,
                twoFactorAuthImagePath,
                advancedImagePath,
                logoutImagePath,
            },
            advancedSettings: {
                setSetting: setting => this.props.setSetting(setting),
                onResetWalletPress: () => this.onResetWalletPress(),
                node: this.props.fullNode,
                textColor: { color: secondaryBackgroundColor },
                borderColor: { borderBottomColor: secondaryBackgroundColor },
                arrowLeftImagePath,
                addImagePath,
                secondaryBackgroundColor,
            },
            accountManagement: {
                setSetting: setting => this.props.setSetting(setting),
                onDeleteAccountPress: () => this.onDeleteAccountPress(),
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                arrowLeftImagePath,
                keyImagePath,
                addImagePath,
            },
            viewSeed: {
                seedIndex: this.props.seedIndex,
                password: this.props.password,
                backPress: () => this.props.setSetting('accountManagement'),
                onWrongPassword: () => this.onWrongPassword(),
                negativeColor,
                borderColor: { borderColor: secondaryBackgroundColor },
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                arrowLeftImagePath,
            },
            viewAddresses: {
                addressData: this.props.selectedAccount.addresses,
                backPress: () => this.props.setSetting('accountManagement'),
                arrowLeftImagePath,
            },
            editAccountName: {
                seedIndex: this.props.seedIndex,
                accountName: this.props.selectedAccountName,
                saveAccountName: accountName => this.saveAccountName(accountName),
                backPress: () => this.props.setSetting('accountManagement'),
                negativeColor,
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                tickImagePath,
                arrowLeftImagePath,
            },
            deleteAccount: {
                backPress: () => this.props.setSetting('accountManagement'),
                password: this.props.password,
                onWrongPassword: () => this.onWrongPassword(),
                deleteAccount: () => this.deleteAccount(),
                currentAccountName: this.props.selectedAccountName,
                negativeColor,
                backgroundColor,
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                borderColor: { borderColor: secondaryBackgroundColor },
                tickImagePath,
                arrowLeftImagePath,
            },
            addNewAccount: {
                addExistingSeed: () => this.props.setSetting('addExistingSeed'),
                addNewSeed: () => this.navigateNewSeed(),
                backPress: () => this.props.setSetting('accountManagement'),
                textColor: { color: secondaryBackgroundColor },
                arrowLeftImagePath,
                keyImagePath,
                addImagePath,
            },
            addExistingSeed: {
                seedCount: this.props.seedCount,
                addAccount: (seed, accountName) => this.addExistingSeed(seed, accountName),
                backPress: () => this.props.setSetting('addNewAccount'),
                negativeColor,
                backgroundColor,
                ctaColor,
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                borderColor: { borderColor: secondaryBackgroundColor },
                arrowLeftImagePath,
                ctaBorderColor,
                secondaryCtaColor,
                generateAlert: (type, title, message) => this.props.generateAlert(type, title, message),
            },
            nodeSelection: {
                setNode: selectedNode => {
                    changeIotaNode(selectedNode);
                    this.props.setFullNode(selectedNode);
                },
                node: this.props.fullNode,
                nodes: this.props.availablePoWNodes,
                backPress: () => this.props.setSetting('advancedSettings'),
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                tickImagePath,
                arrowLeftImagePath,
            },
            addCustomNode: {
                setNode: selectedNode => {
                    changeIotaNode(selectedNode);
                    this.props.setFullNode(selectedNode);
                },
                nodes: this.props.availablePoWNodes,
                onDuplicateNodeError: () => this.onDuplicateNodeError(),
                checkNode: cb => checkNode(cb), // TODO: Try to get rid of the callback
                currentNode: this.props.fullNode,
                onAddNodeError: () => this.onAddNodeError(),
                onAddNodeSuccess: customNode => this.onAddNodeSuccess(customNode),
                backPress: () => this.props.setSetting('advancedSettings'),
                negativeColor,
                textColor: { color: secondaryBackgroundColor },
                secondaryBackgroundColor,
                arrowLeftImagePath,
                addImagePath,
            },
            currencySelection: {
                getCurrencyData: (currency, withAlerts) => this.props.getCurrencyData(currency, withAlerts),
                currency: this.props.currency,
                currencies: this.props.availableCurrencies,
                backPress: () => this.props.setSetting('mainSettings'),
                secondaryBackgroundColor,
                negativeColor,
                isFetchingCurrencyData: this.props.isFetchingCurrencyData,
                hasErrorFetchingCurrencyData: this.props.hasErrorFetchingCurrencyData,
                tickImagePath,
                arrowLeftImagePath,
            },
            languageSelection: {
                backPress: () => this.props.setSetting('mainSettings'),
                textColor: { color: secondaryBackgroundColor },
                tickImagePath,
                arrowLeftImagePath,
                language,
                setLanguage: lang => this.props.setLanguage(lang),
            },
            changePassword: {
                password: this.props.password,
                setPassword: password => this.props.setPassword(password),
                backPress: () => this.props.setSetting('mainSettings'),
                generateAlert: this.props.generateAlert,
                negativeColor,
                textColor: { color: secondaryBackgroundColor },
                borderColor: { borderColor: secondaryBackgroundColor },
                secondaryBackgroundColor,
                tickImagePath,
                arrowLeftImagePath,
            },
            manualSync: {
                t: this.props.t,
                onManualSyncPress: () => this.onManualSyncPress(),
                backPress: () => this.props.setSetting('advancedSettings'),
                isSyncing: this.props.isSyncing,
                textColor: { color: secondaryBackgroundColor },
                borderColor: { borderColor: secondaryBackgroundColor },
                secondaryBackgroundColor,
                negativeColor,
                arrowLeftImagePath,
            },
            snapshotTransition: {
                t: this.props.t,
                backPress: () => this.props.setSetting('advancedSettings'),
                isTransitioning,
                textColor: { color: secondaryBackgroundColor },
                borderColor: { borderColor: secondaryBackgroundColor },
                secondaryBackgroundColor,
                negativeColor,
                backgroundColor: THEMES.getHSL(backgroundColor),
                arrowLeftImagePath,
                transitionBalance,
                transitionAddresses,
                balanceCheckToggle,
                seedIndex,
                selectedAccountName,
                addresses: Object.keys(selectedAccount.addresses),
                transitionForSnapshot: (seed, addresses) => transitionForSnapshot(seed, addresses),
                generateAddressesAndGetBalance: (seed, index) => generateAddressesAndGetBalance(seed, index),
                completeSnapshotTransition: (seed, accountName, addresses) =>
                    completeSnapshotTransition(seed, accountName, addresses),
                shouldPreventAction: () => this.shouldPreventAction(),
                generateAlert: (success, title, message) => this.props.generateAlert(success, title, message),
            },
            themeCustomisation: {
                backPress: () => this.props.setSetting('mainSettings'),
                onAdvancedPress: () => this.props.setSetting('advancedThemeCustomisation'),
                backgroundColor,
                barColor,
                theme: this.props.theme,
                themeName: this.props.themeName,
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
                secondaryBackgroundColor,
                tickImagePath,
                arrowLeftImagePath,
                secondaryBarColor,
            },
            advancedThemeCustomisation: {
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
                theme: this.props.theme,
                backgroundColor,
                barColor,
                ctaColor,
                positiveColor,
                negativeColor,
                extraColor,
                backPress: () => this.props.setSetting('themeCustomisation'),
                textColor: { color: secondaryBackgroundColor },
                tickImagePath,
                arrowLeftImagePath,
            },
            securitySettings: {
                setSetting: (setting) => this.props.setSetting(setting),
                backPress: () => this.props.setSetting('mainSettings'),
                on2FASetupPress: () => this.on2FASetupPress(),
                onFingerSetup: () => this.onFingerSetup(),
                node: this.props.fullNode,
                textColor: { color: secondaryBackgroundColor },
                borderColor: { borderBottomColor: secondaryBackgroundColor },
                arrowLeftImagePath,
                addImagePath,
                secondaryBackgroundColor,
            },
        };

        return props[child] || {};
    }

    showModal() {
        this.setState({ isModalVisible: true });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    on2FASetupPress() {
        const { t, is2FAEnabled } = this.props;
        if (!is2FAEnabled) {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'twoFactorSetupAddKey',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                        generateAlert: this.props.generateAlert,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
            })
          }
        } else {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'disable2FA',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                        generateAlert: this.props.generateAlert,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
              });

        onFingerSetup() {
        const { isFingerprintEnabled } = this.props;
        if (isFingerprintEnabled) {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'fingerprintDisable',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                        generateAlert: this.props.generateAlert,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
            });
        } else if (!FingerprintScanner.isSensorAvailable()) {
            this.props.generateAlert(
                'error',
                'No Fingerprint Sensor',
                'Your device is missing a fingerprint sensor or is not configured in the device settings',
            );
        } else {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'fingerprintEnable',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                        generateAlert: this.props.generateAlert,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
            });
        }
    }

    shouldPreventAction() {
        const {
            isTransitioning,
            isSendingTransfer,
            isGeneratingReceiveAddress,
            isFetchingAccountInfo,
            isSyncing,
        } = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            isSendingTransfer || isGeneratingReceiveAddress || isTransitioning || isFetchingAccountInfo || isSyncing;

        return isAlreadyDoingSomeHeavyLifting;
    }

    onManualSyncPress() {
        const { seedIndex, selectedAccountName, t } = this.props;

        if (!this.shouldPreventAction()) {
            keychain
                .get()
                .then(credentials => {
                    if (get(credentials, 'data')) {
                        const seed = getSeed(credentials.data, seedIndex);
                        this.props.manuallySyncAccount(seed, selectedAccountName);
                    } else {
                        this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongExplanation'),
                        );
                    }
                })
                .catch(err => console.error(err)); // eslint-disable-line no-console
        } else {
            this.props.generateAlert('error', 'Please wait', 'Please wait and try again.');
        }
    }

    onAddNodeError() {
        return this.props.generateAlert(
            'error',
            'Custom node could not be added',
            'The node returned an invalid response.',
        );
    }

    onDuplicateNodeError() {
        return this.props.generateAlert('error', 'Duplicate node', 'The custom node is already listed.');
    }

    onAddNodeSuccess(customNode) {
        this.props.addCustomPoWNode(customNode);

        return this.props.generateAlert('success', 'Custom node added', 'The custom node has been added successfully.');
    }

    fetchAccountInfo(seed, accountName) {
        this.props.setAdditionalAccountInfo({
            addingAdditionalAccount: true,
            additionalAccountName: accountName,
            seed,
        });

        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    // UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const { t, seedNames, password, navigator } = this.props;

        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedInvalidChars'),
                t('addAdditionalSeed:seedInvalidCharsExplanation'),
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
        } else if (!(accountName.length > 0)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        } else if (seedNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            keychain
                .get()
                .then(credentials => {
                    if (isNull(credentials)) {
                        this.fetchAccountInfo(seed, accountName);
                    } else {
                        if (hasDuplicateAccountName(credentials.data, accountName)) {
                            this.props.generateAlert(
                                'error',
                                t('addAdditionalSeed:nameInUse'),
                                t('addAdditionalSeed:nameInUseExplanation'),
                            );
                        } else if (hasDuplicateSeed(credentials.data, seed)) {
                            this.props.generateAlert(
                                'error',
                                t('addAdditionalSeed:seedInUse'),
                                t('addAdditionalSeed:seedInUseExplanation'),
                            );
                        } else {
                            this.fetchAccountInfo(seed, accountName);
                        }
                    }
                })
                .catch(err => console.log(err)); // eslint-disable no-console
        }
    }

    // EditAccountName method
    saveAccountName(accountName) {
        const { seedIndex, seedNames, password, selectedAccountName, t, accountInfo } = this.props;

        if (seedNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            // Update keychain
            updateAccountNameInKeychain(seedIndex, accountName, password)
                .then(() => {
                    const keyMap = { [selectedAccountName]: accountName };
                    const newAccountInfo = renameKeys(accountInfo, keyMap);

                    const updateName = (name, idx) => {
                        if (idx === seedIndex) {
                            return accountName;
                        }

                        return name;
                    };

                    const updatedSeedNames = map(seedNames, updateName);
                    this.props.changeAccountName(newAccountInfo, updatedSeedNames);
                    this.props.setSetting('accountManagement');

                    this.props.generateAlert('success', t('nicknameChanged'), t('nicknameChangedExplanation'));
                })
                .catch(err => console.log(err)); // eslint-disable-line no-console
        }
    }

    // EditAccountName and ViewSeed method
    onWrongPassword() {
        const { t } = this.props;

        return this.props.generateAlert(
            'error',
            t('global:unrecognisedPassword'),
            t('global:unrecognisedPasswordExplanation'),
        );
    }

    // DeleteAccount method
    deleteAccount() {
        const { seedIndex, password, selectedAccountName } = this.props;

        deleteFromKeychain(seedIndex, password)
            .then(() => this.props.deleteAccount(selectedAccountName))
            .catch(err => console.error(err));
    }

    setModalContent(modalSetting) {
        let modalContent;
        const { secondaryBackgroundColor, backgroundColor } = this.props;
        switch (modalSetting) {
            case 'logoutConfirmation':
                modalContent = (
                    <LogoutConfirmationModal
                        style={{ flex: 1 }}
                        hideModal={() => this.hideModal()}
                        logout={() => this.logout()}
                        backgroundColor={THEMES.getHSL(backgroundColor)}
                        textColor={{ color: secondaryBackgroundColor }}
                        borderColor={{ borderColor: secondaryBackgroundColor }}
                    />
                );
                break;
        }

        this.setState({
            modalSetting,
            modalContent,
        });

        this.showModal();
    }

    onDeleteAccountPress() {
        const { seedCount, t } = this.props;

        if (seedCount === 1) {
            return this.props.generateAlert(
                'error',
                t('global:cannotPerformAction'),
                t('global:cannotPerformActionExplanation'),
            );
        }

        return this.props.setSetting('deleteAccount');
    }

    featureUnavailable() {
        const { t } = this.props;

        return this.props.generateAlert('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    onResetWalletPress() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'walletResetConfirm',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    logout() {
        this.props.clearTempData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    navigateNewSeed() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'newSeedSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
        BackHandler.removeEventListener('homeBackPress');
    }

    renderModalContent() {
        return (
            <View style={[styles.modalContent, { backgroundColor: THEMES.getHSL(this.props.backgroundColor) }]}>
                {this.state.modalContent}
            </View>
        );
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);

        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }} />
                <View style={styles.settingsContainer}>
                    <SettingsContent component={this.props.currentSetting} {...childrenProps} />
                </View>
                <View style={{ flex: 1 }} />
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={THEMES.getHSL(this.props.backgroundColor)}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapDispatchToProps = {
    clearTempData,
    setSetting,
    changeAccountName,
    deleteAccount,
    setFullNode,
    getCurrencyData,
    setPassword,
    addCustomPoWNode,
    generateAlert,
    manuallySyncAccount,
    updateTheme,
    setAdditionalAccountInfo,
    update2FA,
    setLanguage,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
};

const mapStateToProps = state => ({
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    currentSetting: state.tempAccount.currentSetting,
    seedIndex: state.tempAccount.seedIndex,
    password: state.tempAccount.password,
    seedNames: state.account.seedNames,
    accountInfo: state.account.accountInfo,
    seedCount: state.account.seedCount,
    currency: state.settings.currency,
    mode: state.settings.mode,
    availableCurrencies: state.settings.availableCurrencies,
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    themeName: state.settings.themeName,
    isSyncing: state.tempAccount.isSyncing,
    theme: state.settings.theme,
    backgroundColor: state.settings.theme.backgroundColor,
    barColor: state.settings.theme.barColor,
    ctaColor: state.settings.theme.ctaColor,
    secondaryCtaColor: state.settings.theme.secondaryCtaColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    extraColor: state.settings.theme.extraColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    is2FAEnabled: state.account.is2FAEnabled,
    isFingerprintEnabled: state.account.isFingerprintEnabled,
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
    language: state.settings.language,
    secondaryBarColor: state.settings.theme.secondaryBarColor,
    isTransitioning: state.tempAccount.isTransitioning,
    transitionBalance: state.tempAccount.transitionBalance,
    transitionAddresses: state.tempAccount.transitionAddresses,
    balanceCheckToggle: state.tempAccount.balanceCheckToggle,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
});

export default translate(['settings', 'global', 'addAdditionalSeed', 'deleteAccount', 'manualSync'])(
    connect(mapStateToProps, mapDispatchToProps)(Settings),
);
