import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, BackHandler, NativeModules } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
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
    setMode,
} from 'iota-wallet-shared-modules/actions/settings';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { renameKeys, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import { changeIotaNode, checkNode } from 'iota-wallet-shared-modules/libs/iota';
import KeepAwake from 'react-native-keep-awake';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';
import SettingsContent from '../components/SettingsContent';
import {
    getSeedFromKeychain,
    hasDuplicateAccountName,
    hasDuplicateSeed,
    updateAccountNameInKeychain,
    deleteSeedFromKeychain,
    getAllSeedsFromKeychain,
} from '../utils/keychain';
import { clearTempData, setPassword, setSetting, setAdditionalAccountInfo } from '../../shared/actions/tempAccount';
import { height } from '../utils/dimensions';
import { isAndroid, isIOS } from '../utils/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    settingsContainer: {
        flex: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1,
        paddingVertical: height / 40,
    },
    modalContent: {
        justifyContent: 'center',
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
        accountNames: PropTypes.array.isRequired,
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
        primary: PropTypes.object.isRequired,
        positive: PropTypes.object.isRequired,
        extra: PropTypes.object.isRequired,
        input: PropTypes.object.isRequired,
        negative: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        isFingerprintEnabled: PropTypes.bool.isRequired,
        is2FAEnabled: PropTypes.bool.isRequired,
        setLanguage: PropTypes.func.isRequired,
        language: PropTypes.string.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        transitionForSnapshot: PropTypes.func.isRequired,
        transitionBalance: PropTypes.number.isRequired,
        transitionAddresses: PropTypes.array.isRequired,
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        balanceCheckToggle: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        completeSnapshotTransition: PropTypes.func.isRequired,
        isAttachingToTangle: PropTypes.bool.isRequired,
        isPromoting: PropTypes.bool.isRequired,
        setMode: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            modalSetting: 'addNewSeed', // eslint-disable-line react/no-unused-state
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

    on2FASetupPress() {
        const { is2FAEnabled, body } = this.props;
        if (!is2FAEnabled) {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'twoFactorSetupAddKey',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: false,
                },
            });
        } else {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'disable2FA',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: false,
                },
            });
        }
    }

    onFingerprintSetupPress() {
        const { body } = this.props;
        if (isAndroid) {
            this.featureUnavailable();
        } else {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'fingerprintSetup',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: false,
                },
            });
        }
    }

    onManualSyncPress() {
        const { password, selectedAccountName, t } = this.props;

        if (!this.shouldPreventAction()) {
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        return this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongTryAgain'),
                        );
                    }
                    let genFn = null;
                    if (isAndroid) {
                        //  genFn = Android multiAddress function
                    } else if (isIOS) {
                        genFn = NativeModules.Iota.multiAddress;
                    }
                    this.props.manuallySyncAccount(seed, selectedAccountName, genFn);
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
        } else {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
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

    // EditAccountName and ViewSeed method
    onWrongPassword() {
        const { t } = this.props;

        return this.props.generateAlert(
            'error',
            t('global:unrecognisedPassword'),
            t('global:unrecognisedPasswordExplanation'),
        );
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

    onResetWalletPress() {
        const { body } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'walletResetConfirm',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
    }

    setModalContent(modalSetting) {
        let modalContent;
        const { body } = this.props;
        switch (modalSetting) {
            case 'logoutConfirmation':
                modalContent = (
                    <LogoutConfirmationModal
                        style={{ flex: 1 }}
                        hideModal={() => this.hideModal()}
                        logout={() => this.logout()}
                        backgroundColor={body.bg}
                        textColor={{ color: body.color }}
                        borderColor={{ borderColor: body.color }}
                    />
                );
                break;
            default:
                break;
        }

        this.setState({
            modalSetting, // eslint-disable-line react/no-unused-state
            modalContent,
        });

        this.showModal();
    }

    getChildrenProps(child) {
        const {
            theme,
            negative,
            positive,
            primary,
            bar,
            body,
            extra,
            language,
            password,
            input,
            selectedAccountName,
            seedIndex,
            transitionBalance,
            transitionAddresses,
            balanceCheckToggle,
            isTransitioning,
            selectedAccount,
            isAttachingToTangle,
            navigator,
            isPromoting,
            mode,
        } = this.props;
        const textColor = { color: body.color };
        const borderColor = { borderColor: body.color };

        const props = {
            deleteAccount: {
                backPress: () => this.props.setSetting('accountManagement'),
                password: this.props.password,
                onWrongPassword: () => this.onWrongPassword(),
                deleteAccount: () => this.deleteAccount(),
                currentAccountName: this.props.selectedAccountName,
                primaryColor: primary.color,
                backgroundColor: body.bg,
                textColor: { color: body.color },
                bodyColor: body.color,
                borderColor: { borderColor: body.color },
                isPromoting,
                selectedAccountName,
                shouldPreventAction: () => this.shouldPreventAction(),
                generateAlert: (type, title, message) => this.props.generateAlert(type, title, message),
                theme,
            },
            addNewAccount: {
                addExistingSeed: () => this.props.setSetting('addExistingSeed'),
                addNewSeed: () => this.navigateNewSeed(),
                backPress: () => this.props.setSetting('accountManagement'),
                textColor: { color: body.color },
                bodyColor: body.color,
            },
            addExistingSeed: {
                seedCount: this.props.seedCount,
                addAccount: (seed, accountName) => this.addExistingSeed(seed, accountName),
                backPress: () => this.props.setSetting('addNewAccount'),
                body,
                primary,
                theme,
                textColor,
                input,
                borderColor,
                generateAlert: (type, title, message) => this.props.generateAlert(type, title, message),
            },
            nodeSelection: {
                setNode: (selectedNode) => {
                    changeIotaNode(selectedNode);
                    this.props.setFullNode(selectedNode);
                },
                node: this.props.fullNode,
                nodes: this.props.availablePoWNodes,
                backPress: () => this.props.setSetting('advancedSettings'),
                textColor: { color: body.color },
                bodyColor: body.color,
                body,
            },
            addCustomNode: {
                setNode: (selectedNode) => {
                    changeIotaNode(selectedNode);
                    this.props.setFullNode(selectedNode);
                },
                nodes: this.props.availablePoWNodes,
                onDuplicateNodeError: () => this.onDuplicateNodeError(),
                checkNode: (cb) => checkNode(cb), // TODO: Try to get rid of the callback
                currentNode: this.props.fullNode,
                onAddNodeError: () => this.onAddNodeError(),
                onAddNodeSuccess: (customNode) => this.onAddNodeSuccess(customNode),
                backPress: () => this.props.setSetting('advancedSettings'),
                negativeColor: negative.color,
                textColor: { color: body.color },
                bodyColor: body.color,
                theme,
            },
            currencySelection: {
                getCurrencyData: (currency, withAlerts) => this.props.getCurrencyData(currency, withAlerts),
                currency: this.props.currency,
                currencies: this.props.availableCurrencies,
                backPress: () => this.props.setSetting('mainSettings'),
                bodyColor: body.color,
                primaryColor: primary.color,
                isFetchingCurrencyData: this.props.isFetchingCurrencyData,
                hasErrorFetchingCurrencyData: this.props.hasErrorFetchingCurrencyData,
            },
            languageSelection: {
                backPress: () => this.props.setSetting('mainSettings'),
                textColor: { color: body.color },
                language,
                setLanguage: (lang) => this.props.setLanguage(lang),
                bodyColor: body.color,
            },
            changePassword: {
                password: this.props.password,
                setPassword: (password) => this.props.setPassword(password),
                backPress: () => this.props.setSetting('mainSettings'),
                generateAlert: this.props.generateAlert,
                textColor: { color: body.color },
                borderColor: { borderColor: body.color },
                body,
                theme,
            },
            manualSync: {
                t: this.props.t,
                onManualSyncPress: () => this.onManualSyncPress(),
                backPress: () => this.props.setSetting('advancedSettings'),
                isSyncing: this.props.isSyncing,
                textColor: { color: body.color },
                primary,
                body,
                negative,
                password,
                selectedAccountName,
            },
            snapshotTransition: {
                t: this.props.t,
                backPress: () => this.props.setSetting('advancedSettings'),
                isTransitioning,
                password,
                textColor: { color: body.color },
                primary,
                body,
                negativeColor: negative.color,
                transitionBalance,
                transitionAddresses,
                balanceCheckToggle,
                seedIndex,
                selectedAccountName,
                isAttachingToTangle,
                addresses: Object.keys(selectedAccount.addresses),
                transitionForSnapshot: (seed, addresses) => this.performSnapshotTransition(seed, addresses),
                generateAddressesAndGetBalance: (seed, index) => this.props.generateAddressesAndGetBalance(seed, index),
                completeSnapshotTransition: (seed, accountName, addresses) =>
                    this.props.completeSnapshotTransition(seed, accountName, addresses),
                shouldPreventAction: () => this.shouldPreventAction(),
                generateAlert: (success, title, message) => this.props.generateAlert(success, title, message),
            },
            themeCustomisation: {
                backPress: () => this.props.setSetting('mainSettings'),
                onAdvancedPress: () => this.props.setSetting('advancedThemeCustomisation'),
                backgroundColor: body.bg,
                barBg: bar.bg,
                theme: this.props.theme,
                themeName: this.props.themeName,
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
                bodyColor: body.color,
                barColor: bar.color,
                navigator,
            },
            advancedThemeCustomisation: {
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
                theme: this.props.theme,
                backgroundColor: body.bg,
                barBg: bar.bg,
                ctaColor: primary.color,
                positiveColor: positive.color,
                negativeColor: negative.color,
                extraColor: extra.color,
                backPress: () => this.props.setSetting('themeCustomisation'),
                textColor: { color: body.color },
            },
            securitySettings: {
                setSetting: (setting) => this.props.setSetting(setting),
                backPress: () => this.props.setSetting('mainSettings'),
                on2FASetupPress: () => this.on2FASetupPress(),
                onFingerprintSetupPress: () => this.onFingerprintSetupPress(),
                node: this.props.fullNode,
                textColor: { color: body.color },
                borderColor: { borderBottomColor: body.color },
                bodyColor: body.color,
            },
        };

        return props[child] || {};
    }

    logout() {
        const { body } = this.props;
        this.props.clearTempData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    navigateNewSeed() {
        const { body } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'newSeedSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
        BackHandler.removeEventListener('homeBackPress');
    }

    performSnapshotTransition(seed, address) {
        let genFn = null;
        if (isAndroid) {
            //  genFn = Android address function
        } else if (isIOS) {
            genFn = NativeModules.Iota.multiAddress;
        }
        this.props.transitionForSnapshot(seed, address, genFn);
    }

    featureUnavailable() {
        const { t } = this.props;

        return this.props.generateAlert('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    fetchAccountInfo(seed, accountName) {
        const { body } = this.props;

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
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    deleteAccount() {
        const { password, selectedAccountName } = this.props;

        deleteSeedFromKeychain(password, selectedAccountName)
            .then(() => this.props.deleteAccount(selectedAccountName))
            .catch((err) => console.error(err));
    }

    showModal() {
        this.setState({ isModalVisible: true });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    // UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const { t, accountNames, password } = this.props;
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
        } else if (accountNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            if (this.shouldPreventAction()) {
                return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
            }
            getAllSeedsFromKeychain(password)
                .then((seedInfo) => {
                    if (isNull(seedInfo)) {
                        return this.fetchAccountInfo(seed, accountName);
                    }
                    if (hasDuplicateAccountName(seedInfo, accountName)) {
                        return this.props.generateAlert(
                            'error',
                            t('addAdditionalSeed:nameInUse'),
                            t('addAdditionalSeed:nameInUseExplanation'),
                        );
                    } else if (hasDuplicateSeed(seedInfo, seed)) {
                        return this.props.generateAlert(
                            'error',
                            t('addAdditionalSeed:seedInUse'),
                            t('addAdditionalSeed:seedInUseExplanation'),
                        );
                    }
                    return this.fetchAccountInfo(seed, accountName);
                })
                .catch((err) => console.log(err)); // eslint-disable no-console
        }
    }

    // EditAccountName method


    shouldPreventAction() {
        const {
            isTransitioning,
            isSendingTransfer,
            isGeneratingReceiveAddress,
            isFetchingAccountInfo,
            isSyncing,
        } = this.props;
        const isAlreadyDoingSomeHeavyLifting =
            isSyncing || isSendingTransfer || isGeneratingReceiveAddress || isTransitioning || isFetchingAccountInfo;

        return isAlreadyDoingSomeHeavyLifting;
    }

    renderModalContent() {
        const { body } = this.props;
        return <View style={[styles.modalContent, { backgroundColor: body.bg }]}>{this.state.modalContent}</View>;
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);
        const { body } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }} />
                <View style={styles.settingsContainer}>
                    <SettingsContent component={this.props.currentSetting} {...childrenProps} />
                </View>
                <View style={{ flex: 1 }} />
                <Modal
                    animationIn="bounceInUp"
                    animationOut="bounceOut"
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    useNativeDriver
                    hideModalContentWhileAnimating
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
    setMode,
};

const mapStateToProps = (state) => ({
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.accountNames),
    currentSetting: state.tempAccount.currentSetting,
    seedIndex: state.tempAccount.seedIndex,
    password: state.tempAccount.password,
    accountNames: state.account.accountNames,
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
    body: state.settings.theme.body,
    bar: state.settings.theme.bar,
    primary: state.settings.theme.primary,
    input: state.settings.theme.input,
    label: state.settings.theme.label,
    positive: state.settings.theme.positive,
    negative: state.settings.theme.negative,
    extra: state.settings.theme.extra,
    is2FAEnabled: state.account.is2FAEnabled,
    isFingerprintEnabled: state.account.isFingerprintEnabled,
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    language: state.settings.language,
    isTransitioning: state.tempAccount.isTransitioning,
    transitionBalance: state.tempAccount.transitionBalance,
    transitionAddresses: state.tempAccount.transitionAddresses,
    balanceCheckToggle: state.tempAccount.balanceCheckToggle,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isPromoting: state.polling.isPromoting,
    isAttachingToTangle: state.tempAccount.isAttachingToTangle,
});

export default translate(['settings', 'global', 'addAdditionalSeed', 'deleteAccount', 'manualSync'])(
    connect(mapStateToProps, mapDispatchToProps)(Settings),
);
