import get from 'lodash/get';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar, BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import THEMES from '../theme/themes';
import { clearTempData, setPassword, setSetting, setAdditionalAccountInfo } from '../../shared/actions/tempAccount';
import { changeAccountName, deleteAccount, manuallySyncAccount } from 'iota-wallet-shared-modules/actions/account';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import {
    setFullNode,
    getCurrencyData,
    addCustomPoWNode,
    updateTheme,
} from 'iota-wallet-shared-modules/actions/settings';
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
        backgroundColor: '#16313a',
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
        positiveColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        extraColor: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            modalSetting: 'addNewSeed',
            modalContent: <LogoutConfirmationModal />,
            selectedCurrency: this.props.currency,
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
        const props = {
            mainSettings: {
                t: this.props.t,
                setSetting: setting => this.props.setSetting(setting),
                setModalContent: content => this.setModalContent(content),
                on2FASetupPress: () => this.featureUnavailable(),
                onThemePress: () => this.props.setSetting('themeCustomisation'),
                onModePress: () => this.featureUnavailable(),
                mode: this.props.mode,
                onLanguagePress: () => this.featureUnavailable(),
                themeName: this.props.themeName,
                currency: this.props.currency,
            },
            advancedSettings: {
                setSetting: setting => this.props.setSetting(setting),
                onResetWalletPress: () => this.onResetWalletPress(),
                node: this.props.fullNode,
            },
            accountManagement: {
                setSetting: setting => this.props.setSetting(setting),
                onDeleteAccountPress: () => this.onDeleteAccountPress(),
            },
            viewSeed: {
                seedIndex: this.props.seedIndex,
                password: this.props.password,
                backPress: () => this.props.setSetting('accountManagement'),
                onWrongPassword: () => this.onWrongPassword(),
                negativeColor: this.props.negativeColor,
            },
            viewAddresses: {
                addressData: this.props.selectedAccount.addresses,
                backPress: () => this.props.setSetting('accountManagement'),
            },
            editAccountName: {
                seedIndex: this.props.seedIndex,
                accountName: this.props.selectedAccountName,
                saveAccountName: accountName => this.saveAccountName(accountName),
                backPress: () => this.props.setSetting('accountManagement'),
                negativeColor: this.props.negativeColor,
            },
            deleteAccount: {
                backPress: () => this.props.setSetting('accountManagement'),
                password: this.props.password,
                onWrongPassword: () => this.onWrongPassword(),
                deleteAccount: () => this.deleteAccount(),
                currentAccountName: this.props.selectedAccountName,
                negativeColor: this.props.negativeColor,
                backgroundColor: this.props.backgroundColor,
            },
            addNewAccount: {
                addExistingSeed: () => this.props.setSetting('addExistingSeed'),
                addNewSeed: () => this.navigateNewSeed(),
                backPress: () => this.props.setSetting('accountManagement'),
            },
            addExistingSeed: {
                seedCount: this.props.seedCount,
                addAccount: (seed, accountName) => this.addExistingSeed(seed, accountName),
                backPress: () => this.props.setSetting('addNewAccount'),
                negativeColor: this.props.negativeColor,
                backgroundColor: this.props.backgroundColor,
                ctaColor: this.props.ctaColor,
            },
            nodeSelection: {
                setNode: selectedNode => {
                    changeIotaNode(selectedNode);
                    this.props.setFullNode(selectedNode);
                },
                node: this.props.fullNode,
                nodes: this.props.availablePoWNodes,
                backPress: () => this.props.setSetting('advancedSettings'),
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
                negativeColor: this.props.negativeColor,
            },
            currencySelection: {
                getCurrencyData: currency => this.props.getCurrencyData(currency),
                currency: this.props.currency,
                currencies: this.props.availableCurrencies,
                backPress: () => this.props.setSetting('mainSettings'),
                setCurrencySetting: currency => this.setState({ selectedCurrency: currency }),
            },
            languageSelection: {
                backPress: () => this.props.setSetting('mainSettings'),
            },
            changePassword: {
                password: this.props.password,
                setPassword: password => this.props.setPassword(password),
                backPress: () => this.props.setSetting('mainSettings'),
                generateAlert: this.props.generateAlert,
                negativeColor: this.props.negativeColor,
            },
            manualSync: {
                t: this.props.t,
                onManualSyncPress: () => this.onManualSyncPress(),
                backPress: () => this.props.setSetting('advancedSettings'),
                isSyncing: this.props.isSyncing,
            },
            themeCustomisation: {
                backPress: () => this.props.setSetting('mainSettings'),
                onAdvancedPress: () => this.props.setSetting('advancedThemeCustomisation'),
                backgroundColor: this.props.backgroundColor,
                theme: this.props.theme,
                themeName: this.props.themeName,
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
            },
            advancedThemeCustomisation: {
                updateTheme: (theme, themeName) => this.props.updateTheme(theme, themeName),
                theme: this.props.theme,
                backgroundColor: this.props.backgroundColor,
                barColor: this.props.barColor,
                ctaColor: this.props.ctaColor,
                positiveColor: this.props.positiveColor,
                negativeColor: this.props.negativeColor,
                extraColor: this.props.extraColor,
                backPress: () => this.props.setSetting('themeCustomisation'),
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

    onManualSyncPress() {
        const { seedIndex, selectedAccountName, t } = this.props;

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
        switch (modalSetting) {
            case 'logoutConfirmation':
                modalContent = (
                    <LogoutConfirmationModal
                        style={{ flex: 1 }}
                        hideModal={() => this.hideModal()}
                        logout={() => this.logout()}
                        backgroundColor={THEMES.getHSL(this.props.backgroundColor)}
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
        });
        BackHandler.removeEventListener('homeBackPress');
    }

    renderModalContent() {
        return <View style={styles.modalContent}>{this.state.modalContent}</View>;
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
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
                    backdropColor={'#132d38'}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
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
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    extraColor: state.settings.theme.extraColor,
});

export default translate(['settings', 'global', 'addAdditionalSeed', 'deleteAccount', 'manualSync'])(
    connect(mapStateToProps, mapDispatchToProps)(Settings),
);
