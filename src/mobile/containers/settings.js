import get from 'lodash/get';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import COLORS from '../theme/Colors';
import { clearTempData, setPassword, setSetting, setSeedIndex, setReady } from '../../shared/actions/tempAccount';
import {
    setFirstUse,
    getFullAccountInfo,
    increaseSeedCount,
    addAccountName,
    changeAccountName,
    deleteAccount,
    setBalance,
    manuallySyncAccount,
    fetchFullAccountInfoForFirstUse,
} from 'iota-wallet-shared-modules/actions/account';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { setFullNode, getCurrencyData, addCustomPoWNode } from 'iota-wallet-shared-modules/actions/settings';
import { calculateBalance } from 'iota-wallet-shared-modules/libs/accountUtils';
import { checkNode } from 'iota-wallet-shared-modules/libs/iota';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { renameKeys, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import Modal from 'react-native-modal';

import LogoutConfirmationModal from '../components/logoutConfirmationModal';
import SettingsContent from '../components/settingsContent';
import { logoutFromWallet } from 'iota-wallet-shared-modules/actions/app';
import { parse } from 'iota-wallet-shared-modules/libs/util';
import keychain, {
    hasDuplicateAccountName,
    hasDuplicateSeed,
    getSeed,
    updateAccountNameInKeychain,
    deleteFromKeychain,
    storeSeedInKeychain,
} from '../util/keychain';
import { width, height } from '../util/dimensions';

class Settings extends Component {
    constructor() {
        super();

        this.state = {
            isModalVisible: false,
            modalSetting: 'addNewSeed',
            modalContent: <LogoutConfirmationModal />,
            selectedCurrency: this.props.settings.currency,
        };
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    getChildrenProps(child) {
        const props = {
            mainSettings: {
                setSetting: setting => this.props.setSetting(setting),
                setModalContent: content => this.setModalContent(content),
                on2FASetupPress: () => this.on2FASetupPress(),
                onThemePress: () => this.featureUnavailable(),
                onModePress: () => this.featureUnavailable(),
                onLanguagePress: () => this.featureUnavailable(),
                theme: this.props.theme,
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
            },
            deleteAccount: {
                backPress: () => this.props.setSetting('accountManagement'),
                password: this.props.password,
                onWrongPassword: () => this.onWrongPassword(),
                deleteAccount: () => this.deleteAccount(),
                currentAccountName: this.props.selectedAccountName,
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
            },
            nodeSelection: {
                setNode: selectedNode => {
                    changeIotaNode(selectedNode);
                    this.props.setNode(selectedNode);
                },
                node: this.props.fullNode,
                nodes: this.props.availablePoWNodes,
                backPress: () => this.props.setSetting('advancedSettings'),
            },
            addCustomNode: {
                setNode: selectedNode => {
                    changeIotaNode(selectedNode);
                    this.props.setNode(selectedNode);
                },
                nodes: this.props.availablePoWNodes,
                onDuplicateNodeError: () => this.onDuplicateNodeError(),
                checkNode: cb => checkNode(cb), // TODO: Try to get rid of the callback
                currentNode: this.props.fullNode,
                onAddNodeError: () => this.onAddNodeError(),
                onAddNodeSuccess: customNode => this.onAddNodeSuccess(customNode),
                backPress: () => this.props.setSetting('advancedSettings'),
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
            },
            manualSync: {
                onManualSyncPress: () => this.onManualSyncPress(),
                backPress: () => this.props.setSetting('advancedSettings'),
                isSyncing: this.props.tempAccount.isSyncing,
            },
        };

        return props[child] || {};
    }

    onManualSyncPress() {
        const { seedIndex, selectedAccountName, manuallySyncAccount, generateAlert } = this.props;

        keychain
            .get()
            .then(credentials => {
                if (get(credentials, 'data')) {
                    const seed = getSeed(credentials.data, seedIndex);
                    manuallySyncAccount(seed, selectedAccountName);
                } else {
                    generateAlert('error', t('global:somethingWentWrong'), t('global:somethingWentWrongExplanation'));
                }
            })
            .catch(err => console.error(err)); // eslint-disable no-console
    }

    onAddNodeError = () => {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Custom node could not be added', 'The node returned an invalid response.');
    };

    onDuplicateNodeError = () => {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Duplicate node', 'The custom node is already listed.');
    };

    onAddNodeSuccess = customNode => {
        const dropdown = DropdownHolder.getDropdown();
        this.props.addCustomPoWNode(customNode);
        dropdown.alertWithType('success', 'Custom node added', 'The custom node has been added successfully.');
    };

    fetchAccountInfo(seed, accountName, password, promise, navigator) {
        navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });

        return this.props.fetchFullAccountInfoForFirstUse(seed, accountName, password, promise, navigator);
    }

    // UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const { t, generateAlert, seedNames, password, navigator } = this.props;

        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:seedInvalidChars'),
                t('addAdditionalSeed:seedInvalidCharsExplanation'),
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
        } else if (!(accountName.length > 0)) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
        } else if (seedNames.includes(accountName)) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
        } else {
            keychain
                .get()
                .then(credentials => {
                    if (isNull(credentials)) {
                        return this.fetchAccountInfo(seed, accountName, password, storeSeedInKeychain, navigator);
                    } else {
                        if (hasDuplicateAccountName(credentials.data, accountName)) {
                            return generateAlert(
                                'error',
                                t('addAdditionalSeed:nameInUse'),
                                t('addAdditionalSeed:nameInUseExplanation'),
                            );
                        } else if (hasDuplicateSeed(credentials.data, seed)) {
                            return generateAlert(
                                'error',
                                t('addAdditionalSeed:seedInUse'),
                                t('addAdditionalSeed:seedInUseExplanation'),
                            );
                        }

                        return this.fetchAccountInfo(seed, accountName, password, storeSeedInKeychain, navigator);
                    }
                })
                .catch(err => console.log(err));
        }
    }

    // EditAccountName method
    saveAccountName(accountName) {
        const { seedIndex, seedNames, password, selectedAccountName, t, generateAlert } = this.props;

        let accountInfo = this.props.account.accountInfo;

        if (seedNames.includes(accountName)) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
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

                    generateAlert('success', t('nicknameChanged'), t('nicknameChangedExplanation'));
                })
                .catch(err => console.log(err));
        }
    }

    // EditAccountName and ViewSeed method
    onWrongPassword() {
        const { t, generateAlert } = this.props;

        return generateAlert('error', t('global:unrecognisedPassword'), t('global:unrecognisedPasswordExplanation'));
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
                        hideModal={() => this._hideModal()}
                        logout={() => this.logout()}
                    />
                );
                break;
        }

        this.setState({
            modalSetting,
            modalContent,
        });

        this._showModal();
    }

    onDeleteAccountPress() {
        const { seedCount, t, generateAlert, setSetting } = this.props;

        if (seedCount === 1) {
            return generateAlert('error', t('global:cannotPerformAction'), t('global:cannotPerformActionExplanation'));
        }

        return setSetting('deleteAccount');
    }

    featureUnavailable() {
        const { t, generateAlert } = this.props;

        return generateAlert('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    onThemePress() {
        const { t, generateAlert } = this.props;

        return generateAlert('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    on2FASetupPress() {
        const { t, generateAlert } = this.props;

        return generateAlert('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    onResetWalletPress() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'walletResetConfirm',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: COLORS.backgroundGreen,
                },
                overrideBackPress: true,
            },
        });
    }

    onBackPress() {
        this.props.setSetting('mainSettings');
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
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: COLORS.backgroundGreen,
                },
                overrideBackPress: true,
            },
        });
    }

    navigateNewSeed() {
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    onAddNewSeedPress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        if (this.props.tempAccount.isSendingTransfer) {
            dropdown.alertWithType('error', t('transferSending'), t('transferSendingExplanation'));
        } else if (this.props.tempAccount.isGeneratingReceiveAddress) {
            dropdown.alertWithType('error', t('generatingAddress'), t('generatingAddressExplanation'));
        } else {
            this.setModalContent('addNewSeed');
        }
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
                    {this._renderModalContent()}
                </Modal>
            </View>
        );
    }
}

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
        width: width,
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
        paddingVertical: height / 20,
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

const mapDispatchToProps = {
    logoutFromWallet,
    clearTempData,
    setFirstUse,
    getFullAccountInfo,
    increaseSeedCount,
    addAccountName,
    setSetting,
    changeAccountName,
    deleteAccount,
    setSeedIndex,
    setNode,
    getCurrencyData,
    setPassword,
    setReady,
    fetchFullAccountInfoForFirstUse,
    setBalance,
    addCustomPoWNode,
    generateAlert,
};

const mapStateToProps = state => ({
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    currentSetting: state.settings.currentSetting,
    seedIndex: state.tempAccount.seedIndex,
    password: state.tempAccount.password,
    seedNames: state.tempAccount.seedNames,
    seedCount: state.account.seedCount,
    account: state.account,
    settings: state.settings,
    tempAccount: state.tempAccount,
});

Settings.propTypes = {
    account: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    logoutFromWallet: PropTypes.func.isRequired,
};

export default translate(['settings', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(Settings),
);
