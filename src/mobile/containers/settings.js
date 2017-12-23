import get from 'lodash/get';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import COLORS from '../theme/Colors';
import {
    clearTempData,
    setPassword,
    setSetting,
    setSeedIndex,
    setReady,
    manualSyncRequest,
    manualSyncComplete,
} from '../../shared/actions/tempAccount';
import {
    setFirstUse,
    getFullAccountInfo,
    increaseSeedCount,
    addAccountName,
    changeAccountName,
    removeAccount,
    setBalance,
} from 'iota-wallet-shared-modules/actions/account';
import { setFullNode, getCurrencyData, addCustomPoWNode } from 'iota-wallet-shared-modules/actions/settings';
import { calculateBalance } from 'iota-wallet-shared-modules/libs/accountUtils';
import { checkNode } from 'iota-wallet-shared-modules/libs/iota';
import { renameKeys, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import Modal from 'react-native-modal';
import AddNewAccount from '../components/addNewAccount';
import UseExistingSeed from '../components/useExistingSeed';
import ChangePassword from '../components/changePassword';
import LogoutConfirmationModal from '../components/logoutConfirmationModal.js';
import ViewSeed from '../components/viewSeed.js';
import ViewAddresses from './viewAddresses.js';
import ManualSync from '../components/manualSync.js';
import DeleteAccount from '../components/deleteAccount.js';
import EditAccountName from '../components/editAccountName.js';
import NodeSelection from '../components/nodeSelection.js';
import AddCustomNode from '../components/addCustomNode.js';
import LanguageSelection from '../components/languageSelection.js';
import CurrencySelection from '../components/currencySelection.js';
import MainSettings from '../components/mainSettings.js';
import AdvancedSettings from '../components/advancedSettings.js';
import AccountManagement from '../components/accountManagement.js';
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

    _renderSettingsContent = content => {
        const { t } = this.props;
        let accountInfo = this.props.account.accountInfo;
        let seedIndex = this.props.tempAccount.seedIndex;
        let currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        let addressData = currentSeedAccountInfo.addresses || {};
        let transfers = currentSeedAccountInfo.transfers || [];
        const dropdown = DropdownHolder.getDropdown();

        switch (content) {
            case 'mainSettings':
                return (
                    <MainSettings
                        setSetting={setting => this.props.setSetting(setting)}
                        setModalContent={content => this.setModalContent(content)}
                        on2FASetupPress={() => this.on2FASetupPress()}
                        onThemePress={() => this.featureUnavailable()}
                        onModePress={() => this.featureUnavailable()}
                        onLanguagePress={() => this.featureUnavailable()}
                        mode={this.props.settings.mode}
                        theme={this.props.settings.theme}
                        currency={this.props.settings.currency}
                    />
                );
                break;
            case 'advancedSettings':
                return (
                    <AdvancedSettings
                        setSetting={setting => this.props.setSetting(setting)}
                        onResetWalletPress={() => this.onResetWalletPress()}
                        node={this.props.settings.fullNode}
                    />
                );
                break;
            case 'accountManagement':
                return (
                    <AccountManagement
                        setSetting={setting => this.props.setSetting(setting)}
                        onDeleteAccountPress={() => this.onDeleteAccountPress()}
                    />
                );
                break;
            case 'viewSeed':
                return (
                    <ViewSeed
                        seedIndex={this.props.tempAccount.seedIndex}
                        password={this.props.tempAccount.password}
                        backPress={() => this.props.setSetting('accountManagement')}
                        onWrongPassword={() => this.onWrongPassword()}
                    />
                );
                break;
            case 'viewAddresses':
                return (
                    <ViewAddresses
                        addressData={addressData}
                        backPress={() => this.props.setSetting('accountManagement')}
                    />
                );
                break;
            case 'editAccountName':
                return (
                    <EditAccountName
                        seedIndex={seedIndex}
                        accountName={this.props.account.seedNames[this.props.tempAccount.seedIndex]}
                        saveAccountName={accountName => this.saveAccountName(accountName)}
                        backPress={() => this.props.setSetting('accountManagement')}
                    />
                );
                break;
            case 'deleteAccount':
                return (
                    <DeleteAccount
                        backPress={() => this.props.setSetting('accountManagement')}
                        password={this.props.tempAccount.password}
                        onWrongPassword={() => this.onWrongPassword()}
                        deleteAccount={() => this.deleteAccount()}
                        currentAccountName={this.props.account.seedNames[this.props.tempAccount.seedIndex]}
                    />
                );
                break;
            case 'addNewAccount':
                return (
                    <AddNewAccount
                        addExistingSeed={() => this.props.setSetting('addExistingSeed')}
                        addNewSeed={() => this.navigateNewSeed()}
                        backPress={() => this.props.setSetting('accountManagement')}
                    />
                );
                break;
            case 'addExistingSeed':
                return (
                    <UseExistingSeed
                        seedCount={this.props.account.seedCount}
                        addAccount={(seed, accountName) => this.addExistingSeed(seed, accountName)}
                        backPress={() => this.props.setSetting('addNewAccount')}
                    />
                );
                break;
            case 'nodeSelection':
                return (
                    <NodeSelection
                        setNode={selectedNode => {
                            changeIotaNode(selectedNode);
                            this.props.setNode(selectedNode);
                        }}
                        node={this.props.settings.fullNode}
                        nodes={this.props.settings.availablePoWNodes}
                        backPress={() => this.props.setSetting('advancedSettings')}
                    />
                );
                break;
            case 'addCustomNode':
                return (
                    <AddCustomNode
                        setNode={selectedNode => {
                            changeIotaNode(selectedNode);
                            this.props.setNode(selectedNode);
                        }}
                        nodes={this.props.settings.availablePoWNodes}
                        onDuplicateNodeError={() => this.onDuplicateNodeError()}
                        checkNode={cb => checkNode(cb)}
                        currentNode={this.props.settings.fullNode}
                        onAddNodeError={() => this.onAddNodeError()}
                        onAddNodeSuccess={customNode => this.onAddNodeSuccess(customNode)}
                        backPress={() => this.props.setSetting('advancedSettings')}
                    />
                );
                break;
            case 'currencySelection':
                return (
                    <CurrencySelection
                        getCurrencyData={currency => this.props.getCurrencyData(currency)}
                        currency={this.props.settings.currency}
                        currencies={this.props.settings.availableCurrencies}
                        backPress={() => this.props.setSetting('mainSettings')}
                        setCurrencySetting={currency => this.setState({ selectedCurrency: currency })}
                        onGetCurrencyDataError={() => this.onGetCurrencyDataError()}
                    />
                );
                break;
            case 'languageSelection':
                return;
                <LanguageSelection backPress={() => this.props.setSetting('mainSettings')} />;
                break;
            case 'changePassword':
                return (
                    <ChangePassword
                        password={this.props.tempAccount.password}
                        setPassword={password => this.props.setPassword(password)}
                        backPress={() => this.props.setSetting('mainSettings')}
                        dropdown={dropdown}
                    />
                );
                break;
            case 'manualSync':
                return (
                    <ManualSync
                        onManualSyncPress={() => this.onManualSyncPress()}
                        backPress={() => this.props.setSetting('advancedSettings')}
                        isSyncing={this.props.tempAccount.isSyncing}
                    />
                );
                break;
        }
    };

    onGetCurrencyDataError() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', t('poorConnection'), t('poorConnectionExplanation'));
    }

    onManualSyncPress() {
        const dropdown = DropdownHolder.getDropdown();
        const { t } = this.props;
        this.props.manualSyncRequest();
        keychain
            .get()
            .then(credentials => {
                if (get(credentials, 'data')) {
                    const seedIndex = this.props.tempAccount.seedIndex;
                    const accountName = this.props.account.seedNames[seedIndex];
                    const seed = getSeed(credentials.data, seedIndex);
                    this.props.getFullAccountInfo(seed, accountName, (error, success) => {
                        if (error) {
                            onNodeError(dropdown);
                        } else {
                            onNodeSuccess(dropdown);
                        }
                    });
                } else {
                    error(dropdown);
                }
            })
            .catch(err => console.log(err));

        onNodeError = dropdown => {
            this.props.manualSyncComplete();
            dropdown.alertWithType('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
        };

        onNodeSuccess = dropdown => {
            this.props.manualSyncComplete();
            dropdown.alertWithType('success', t('syncingComplete'), t('syncingCompleteExplanation'));
        };

        error = dropdown => {
            dropdown.alertWithType('error', t('global:somethingWentWrong'), t('global:somethingWentWrongExplanation'));
        };
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

    //UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        if (!seed.match(VALID_SEED_REGEX) && seed.length == MAX_SEED_LENGTH) {
            dropdown.alertWithType(
                'error',
                t('addAdditionalSeed:seedInvalidChars'),
                t('addAdditionalSeed:seedInvalidCharsExplanation'),
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            dropdown.alertWithType(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
        } else if (!(accountName.length > 0)) {
            dropdown.alertWithType(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        } else if (this.props.account.seedNames.includes(accountName)) {
            dropdown.alertWithType(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            keychain
                .get()
                .then(credentials => {
                    if (isNull(credentials)) {
                        return ifNoKeychainDuplicates(seed, accountName);
                    } else {
                        if (hasDuplicateAccountName(credentials.data, accountName)) {
                            return dropdown.alertWithType(
                                'error',
                                t('addAdditionalSeed:nameInUse'),
                                t('addAdditionalSeed:nameInUseExplanation'),
                            );
                        } else if (hasDuplicateSeed(credentials.data, seed)) {
                            return dropdown.alertWithType(
                                'error',
                                t('addAdditionalSeed:seedInUse'),
                                t('addAdditionalSeed:seedInUseExplanation'),
                            );
                        }

                        return ifNoKeychainDuplicates(seed, accountName);
                    }
                })
                .catch(err => console.log(err));

            ifNoKeychainDuplicates = (seed, accountName) => {
                this.props.setFirstUse(true);
                this.props.navigator.push({
                    screen: 'loading',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                    },
                    animated: false,
                    overrideBackPress: true,
                });
                this.props.getFullAccountInfo(seed, accountName, (error, success) => {
                    if (error) {
                        onNodeError();
                    } else {
                        onNodeSuccess(seed, accountName);
                    }
                });
            };

            onNodeError = () => {
                this.props.navigator.pop({
                    animated: false,
                });
                dropdown.alertWithType('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
                this.props.setFirstUse(false);
            };

            onNodeSuccess = (seed, accountName) => {
                this.props.clearTempData();
                storeSeedInKeychain(this.props.tempAccount.password, seed, accountName)
                    .then(() => {
                        this.props.increaseSeedCount();
                        this.props.addAccountName(accountName);
                        this.props.setReady();
                    })
                    .catch(err => console.log(err));
            };
        }
    }

    //EditAccountName method
    saveAccountName(accountName) {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        let accountInfo = this.props.account.accountInfo;
        let accountNameArray = this.props.account.seedNames;
        let seedIndex = this.props.tempAccount.seedIndex;

        if (accountNameArray.includes(accountName)) {
            dropdown.alertWithType(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            // Update keychain
            updateAccountNameInKeychain(seedIndex, accountName, this.props.tempAccount.password)
                .then(() => {
                    const currentAccountName = accountNameArray[seedIndex];
                    const keyMap = { [currentAccountName]: accountName };
                    const newAccountInfo = renameKeys(accountInfo, keyMap);
                    accountNameArray[seedIndex] = accountName;
                    this.props.changeAccountName(newAccountInfo, accountNameArray);

                    this.props.setSetting('accountManagement');
                    dropdown.alertWithType('success', t('nicknameChanged'), t('nicknameChangedExplanation'));
                })
                .catch(err => console.log(err));
        }
    }

    //EditAccountName and ViewSeed method
    onWrongPassword() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', t('global:unrecognisedPassword'), t('global:unrecognisedPasswordExplanation'));
    }

    //DeleteAccount method
    deleteAccount() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        let seedIndex = this.props.tempAccount.seedIndex;
        const accountNames = this.props.account.seedNames;
        const currentAccountName = accountNames[seedIndex];
        let accountInfo = this.props.account.accountInfo;
        let addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;

        let newAccountInfo = accountInfo;
        delete newAccountInfo[currentAccountName];
        accountNames.splice(seedIndex, 1);

        deleteFromKeychain(seedIndex, this.props.tempAccount.password)
            .then(() => {
                this.props.setSeedIndex(0);
                this.props.removeAccount(newAccountInfo, accountNames);

                seedIndex = this.props.tempAccount.seedIndex;
                accountInfo = this.props.account.accountInfo;
                addressData = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;
                const balance = calculateBalance(addressData);
                this.props.setBalance(balance);
                this.props.setSetting('accountManagement');
                dropdown.alertWithType('success', t('accountDeleted'), t('accountDeletedExplanation'));
            })
            .catch(err => console.log(err));
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
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        if (this.props.account.seedCount == 1) {
            dropdown.alertWithType(
                'error',
                t('global:cannotPerformAction'),
                t('global:cannotPerformActionExplanation'),
            );
        } else {
            this.props.setSetting('deleteAccount');
        }
    }

    featureUnavailable() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    onThemePress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
    }

    on2FASetupPress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
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
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={{ flex: 1 }} />
                <View style={styles.settingsContainer}>
                    {this._renderSettingsContent(this.props.tempAccount.currentSetting)}
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

const mapDispatchToProps = dispatch => ({
    logoutFromWallet: () => dispatch(logoutFromWallet()),
    clearTempData: () => dispatch(clearTempData()),
    setFirstUse: boolean => dispatch(setFirstUse(boolean)),
    getFullAccountInfo: (seed, seedName, cb) => dispatch(getFullAccountInfo(seed, seedName, cb)),
    increaseSeedCount: () => dispatch(increaseSeedCount()),
    addAccountName: seedName => dispatch(addAccountName(seedName)),
    setSetting: setting => dispatch(setSetting(setting)),
    changeAccountName: (newAccountName, accountNames, addresses, transfers) =>
        dispatch(changeAccountName(newAccountName, accountNames, addresses, transfers)),
    removeAccount: (accountInfo, accountNames) => dispatch(removeAccount(accountInfo, accountNames)),
    setSeedIndex: number => dispatch(setSeedIndex(number)),
    setNode: node => dispatch(setFullNode(node)),
    getCurrencyData: currency => dispatch(getCurrencyData(currency)),
    setPassword: password => dispatch(setPassword(password)),
    setReady: () => dispatch(setReady()),
    manualSyncRequest: () => dispatch(manualSyncRequest()),
    manualSyncComplete: () => dispatch(manualSyncComplete()),
    setBalance: balance => dispatch(setBalance(balance)),
    addCustomPoWNode: customNode => dispatch(addCustomPoWNode(customNode)),
});

const mapStateToProps = state => ({
    account: state.account,
    settings: state.settings,
    tempAccount: state.tempAccount,
    settings: state.settings,
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
