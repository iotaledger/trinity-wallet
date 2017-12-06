import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
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
import { setFullNode, getCurrencyData } from 'iota-wallet-shared-modules/actions/settings';
import { renameKeys, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import Modal from 'react-native-modal';
import AddNewAccount from '../components/addNewAccount';
import UseExistingSeed from '../components/useExistingSeed';
import ChangePassword from '../components/changePassword';
import LogoutConfirmationModal from '../components/logoutConfirmationModal.js';
import ViewSeed from '../components/viewSeed.js';
import ViewAddresses from '../components/viewAddresses.js';
import ManualSync from '../components/manualSync.js';
import DeleteAccount from '../components/deleteAccount.js';
import EditAccountName from '../components/editAccountName.js';
import NodeSelection from '../components/nodeSelection.js';
import LanguageSelection from '../components/languageSelection.js';
import CurrencySelection from '../components/currencySelection.js';
import MainSettings from '../components/mainSettings.js';
import AdvancedSettings from '../components/advancedSettings.js';
import AccountManagement from '../components/accountManagement.js';
import { logoutFromWallet } from 'iota-wallet-shared-modules/actions/app';
import { parse } from 'iota-wallet-shared-modules/libs/util';
import {
    getFromKeychain,
    storeSeedInKeychain,
    checkKeychainForDuplicates,
    deleteSeed,
    deleteFromKeyChain,
    replaceKeychainValue,
    getSeed,
} from '../../shared/libs/cryptography';
import DropdownHolder from '../components/dropdownHolder';

import { width, height } from '../util/dimensions';

class Settings extends React.Component {
    constructor(props) {
        super(props);
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
        let addressesWithBalance = currentSeedAccountInfo.addresses || {};
        let transfers = currentSeedAccountInfo.transfers || [];
        const dropdown = DropdownHolder.getDropdown();

        switch (content) {
            case 'mainSettings':
                return (
                    <MainSettings
                        setSetting={setting => this.props.setSetting(setting)}
                        setModalContent={content => this.setModalContent(content)}
                        on2FASetupPress={() => this.on2FASetupPress()}
                        onThemePress={() => this.onThemePress()}
                        onModePress={() => this.onModePress()}
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
                        addressesWithBalance={addressesWithBalance}
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
                        nodes={this.props.settings.availableNodes}
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
                    />
                );
                break;
            case 'languageSelection':
                return <LanguageSelection backPress={() => this.props.setSetting('mainSettings')} />;
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

    onManualSyncPress() {
        const dropdown = DropdownHolder.getDropdown();
        const { t } = this.props;
        this.props.manualSyncRequest();
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                const seedIndex = this.props.tempAccount.seedIndex;
                const accountName = this.props.account.seedNames[seedIndex];
                const seed = getSeed(value, seedIndex);
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
        });

        onNodeError = dropdown => {
            this.props.manualSyncComplete();
            dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
        };

        onNodeSuccess = dropdown => {
            this.props.manualSyncComplete();
            dropdown.alertWithType('success', 'Syncing complete', `Your account has synced successfully.`);
        };

        error = dropdown => {
            dropdown.alertWithType('error', 'Something went wrong', 'Please restart the app.');
        };
    }

    //UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        if (!seed.match(VALID_SEED_REGEX) && seed.length == MAX_SEED_LENGTH) {
            dropdown.alertWithType(
                'error',
                'Seed contains invalid characters',
                `Seeds can only consist of the capital letters A-Z and the number 9. Your seed has invalid characters. Please try again.`,
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            dropdown.alertWithType(
                'error',
                'Seed is too short',
                `Seeds must be ${MAX_SEED_LENGTH} characters long. Your seed is currently ${seed.length} characters long. Please try again.`,
            );
        } else if (!(accountName.length > 0)) {
            dropdown.alertWithType('error', 'No nickname entered', `Please enter a nickname for your seed.`);
        } else if (this.props.account.seedNames.includes(accountName)) {
            dropdown.alertWithType('error', 'Account name already in use', `Please use a unique account name.`);
        } else {
            checkKeychainForDuplicates(
                this.props.tempAccount.password,
                seed,
                accountName,
                (type, title, message) => dropdown.alertWithType(type, title, message),
                () => ifNoKeychainDuplicates(seed, accountName),
            );

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
                dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
                this.props.setFirstUse(false);
            };

            onNodeSuccess = (seed, accountName) => {
                this.props.clearTempData();
                storeSeedInKeychain(this.props.tempAccount.password, seed, accountName);
                this.props.increaseSeedCount();
                this.props.addAccountName(accountName);
                this.props.setReady();
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
                'Account name already in use',
                'This account name is already linked to your wallet. Please use a different one.',
            );
        } else {
            // Update keychain
            getFromKeychain(this.props.tempAccount.password, value => {
                if (typeof value != 'undefined' && value != null) {
                    let seeds = parse(value);
                    seeds[seedIndex].name = accountName;
                    replaceKeychainValue(this.props.tempAccount.password, seeds);
                }
            });

            const currentAccountName = accountNameArray[seedIndex];
            const keyMap = { [currentAccountName]: accountName };
            const newAccountInfo = renameKeys(accountInfo, keyMap);
            accountNameArray[seedIndex] = accountName;
            this.props.changeAccountName(newAccountInfo, accountNameArray);

            this.props.setSetting('accountManagement');
            dropdown.alertWithType('success', 'Account name changed', `Your account name has been changed.`);
        }
    }

    //EditAccountName and ViewSeed method
    onWrongPassword() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Unrecognised password', 'The password was not recognised. Please try again.');
    }

    //DeleteAccount method
    deleteAccount() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        let seedIndex = this.props.tempAccount.seedIndex;
        const accountNames = this.props.account.seedNames;
        const currentAccountName = accountNames[seedIndex];
        let accountInfo = this.props.account.accountInfo;
        let addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;

        let newAccountInfo = accountInfo;
        delete newAccountInfo[currentAccountName];
        accountNames.splice(seedIndex, 1);

        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                deleteSeed(value, this.props.tempAccount.password, seedIndex);
                this.props.setSeedIndex(0);
                this.props.removeAccount(newAccountInfo, accountNames);

                seedIndex = this.props.tempAccount.seedIndex;
                accountInfo = this.props.account.accountInfo;
                addressesWithBalance = accountInfo[Object.keys(accountInfo)[seedIndex]].addresses;

                this.props.setBalance(addressesWithBalance);
                this.props.setSetting('accountManagement');
                dropdown.alertWithType('success', 'Account deleted', `Your account has been removed from the wallet.`);
            } else {
                error();
            }
        });
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
            dropdown.alertWithType('error', 'Cannot perform action', 'Go to advanced settings to reset the wallet.');
        } else {
            this.props.setSetting('deleteAccount');
        }
    }

    onModePress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onCurrencyPress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onThemePress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    on2FASetupPress() {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onResetWalletPress() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'wallet-reset-confirm',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundImageName: 'bg-blue.png',
                    screenBackgroundColor: '#102e36',
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
                    screenBackgroundColor: '#102e36',
                },
                overrideBackPress: true,
            },
        });
    }

    navigateNewSeed() {
        //this.props.endBackgroundProcesses();
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
            dropdown.alertWithType('error', 'Transfer sending', 'Please wait until your transfer has been sent.');
        } else if (this.props.tempAccount.isGeneratingReceiveAddress) {
            dropdown.alertWithType(
                'error',
                'Generating receive address',
                'Please wait until your address has been generated.',
            );
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
    separator: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.3,
        width: width / 1.16,
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
    setBalance: address => dispatch(setBalance(address)),
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
