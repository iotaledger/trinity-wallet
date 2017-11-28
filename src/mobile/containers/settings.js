import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearTempData, setPassword, setSetting, setSeedIndex} from '../../shared/actions/tempAccount';
import { setFirstUse, getAccountInfoNewSeed, increaseSeedCount, addAccountName, changeAccountName, removeAccount } from '../../shared/actions/account';
import { setNode, getCurrencyData } from '../../shared/actions/settings'
import { renameKeys } from '../../shared/libs/util'
import store from '../../shared/store';
import Modal from 'react-native-modal';
import AddNewAccount from '../components/addNewAccount';
import UseExistingSeed from '../components/useExistingSeed';
import ChangePassword from '../components/changePassword';
import LogoutConfirmationModal from '../components/logoutConfirmationModal.js';
import ViewSeed from '../components/viewSeed.js';
import ViewAddresses from '../components/viewAddresses.js'
import DeleteAccount from '../components/deleteAccount.js'
import EditAccountName from '../components/editAccountName.js'
import NodeSelection from '../components/nodeSelection.js'
import CurrencySelection from '../components/currencySelection.js'
import { logoutFromWallet } from '../../shared/actions/app';
import { getFromKeychain, storeSeedInKeychain, deleteSeed, deleteFromKeyChain, replaceKeychainValue } from '../../shared/libs/cryptography';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import DropdownHolder from '../components/dropdownHolder';

const width = Dimensions.get('window').width;
const height = global.height;

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            modalSetting: 'addNewSeed',
            modalContent: <LogoutConfirmationModal />,
            selectedNode: '',
            selectedCurrency: this.props.settings.currency
        };
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    _renderSettingsContent = (content) => {
        let accountInfo = this.props.account.accountInfo;
        let seedIndex = this.props.tempAccount.seedIndex;
        let currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        let addressesWithBalance = currentSeedAccountInfo.addresses || {};
        let transfers = currentSeedAccountInfo.transfers || [];
        const dropdown = DropdownHolder.getDropdown();

        switch (content) {
            case 'mainSettings':
                return (
                    <View>
                        <TouchableOpacity onPress={event => this.onModePress()}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/mode.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Mode</Text>
                                <Text style={styles.settingText}>{this.props.settings.mode}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onThemePress()}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/theme.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Theme</Text>
                                <Text style={styles.settingText}>{this.props.settings.theme}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.props.setSetting('currencySelection')}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/currency.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Currency</Text>
                                <Text style={styles.settingText}>{this.props.settings.currency}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onLanguagePress()}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/language.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Language</Text>
                                <Text style={styles.settingText}>{this.props.settings.language}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity onPress={event => this.onAccountManagementPress()}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/account.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Account management</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.on2FASetupPress()}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/2fa.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Two-factor authentication</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.props.setSetting('changePassword')}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/password.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Change password</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity onPress={event => this.props.setSetting('advancedSettings')}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/advanced.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Advanced settings</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.setModalContent('logoutConfirmation')}>
                            <View style={styles.item}>
                                <Image source={require('../../shared/images/logout.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Log out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                );
                break;
            case 'advancedSettings':
                return (
                    <View style={styles.advancedSettingsContainer}>
                        <View style={{flex:1, justifyContent: 'flex-start'}}>
                            <TouchableOpacity onPress={event => this.props.setSetting('nodeSelection')}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/node.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Select node</Text>
                                    <Text numberOfLines={1} style={styles.subtitleText}>{this.state.selectedNode}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity onPress={event => this.onResetWalletPress()}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/reset.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Reset Wallet</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={event => this.onBackPress()}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
                break;
            case 'accountManagement':
                return (
                    <View style={styles.advancedSettingsContainer}>
                        <View style={{ flex: 4, justifyContent: 'flex-start'}}>
                            <TouchableOpacity onPress={event => this.props.setSetting('viewSeed')}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/key.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>View seed</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={event => this.props.setSetting('viewAddresses')}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/addresses.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>View addresses</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={event => this.props.setSetting('editAccountName')}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/edit.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Edit account name</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={event => this.onDeleteAccountPress()}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/delete.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Delete account</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity onPress={event => this.props.setSetting('addNewAccount')}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/add.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Add new account</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 0.5, justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={event => this.onBackPress()}>
                                <View style={styles.item}>
                                    <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                                    <Text style={styles.titleText}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                        saveAccountName={(accountName) => this.saveAccountName(accountName)}
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
                        setNode={(selectedNode) => this.props.setNode(selectedNode)}
                        node={this.props.settings.fullNode}
                        nodes={this.props.settings.availableNodes}
                        backPress={() => this.props.setSetting('advancedSettings')}
                        setNodeSetting={(selectedNode) => this.setState({selectedNode: selectedNode})}
                    />
                );
                break;
            case 'currencySelection':
                return (
                    <CurrencySelection
                        getCurrencyData={(currency) => this.props.getCurrencyData(currency)}
                        currency={this.props.settings.currency}
                        currencies={this.props.settings.availableCurrencies}
                        backPress={() => this.props.setSetting('mainSettings')}
                        setCurrencySetting={(currency) => this.setState({selectedCurrency: currency})}
                    />
                );
                break;
            case 'changePassword':
                return (
                    <ChangePassword
                        password={this.props.tempAccount.password}
                        setPassword={(password) => this.props.setPassword(password)}
                        backPress={() => this.props.setSetting('mainSettings')}
                        dropdown={dropdown}
                    />
                );
                break;
        }
    };

    //UseExistingSeed method
    addExistingSeed(seed, accountName) {
        const dropdown = DropdownHolder.getDropdown();
        if (!seed.match(/^[A-Z9]+$/) && seed.length == 81) {
            dropdown.alertWithType(
                'error',
                'Seed contains invalid characters',
                `Seeds can only consist of the capital letters A-Z and the number 9. Your seed has invalid characters. Please try again.`,
            );
        } else if (seed.length < 81) {
            dropdown.alertWithType(
                'error',
                'Seed is too short',
                `Seeds must be 81 characters long. Your seed is currently ${seed
                    .length} characters long. Please try again.`,
            );
        } else if (!(accountName.length > 0)) {
            dropdown.alertWithType('error', 'No nickname entered', `Please enter a nickname for your seed.`);
        } else if (this.props.account.seedNames.includes(accountName)) {
            dropdown.alertWithType(
                'error',
                'Account name already in use',
                `Please use a unique account name.`,
            );
        } else {
            this.props.clearTempData();
            storeSeedInKeychain(
                this.props.tempAccount.password,
                seed,
                accountName,
                (type, title, message) => dropdown.alertWithType(type, title, message),
                () => {
                    this.props.setFirstUse(true);
                    this.props.getAccountInfoNewSeed(seed, accountName, (error, success) => {
                        if (error) {
                            this.onExistingSeedNodeError();
                        } else {
                            this.onExistingSeedNodeSuccess(accountName);
                        }
                    });
                    this.props.navigator.push({
                        screen: 'loading',
                        navigatorStyle: {
                            navBarHidden: true,
                            navBarTransparent: true,
                        },
                        animated: false,
                        overrideBackPress: true,
                    });
                },
            );
        }
    }

    //UseExistingSeed method
    onExistingSeedNodeError() {
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                var lastSeedIndex = this.props.account.seedCount - 1;
                deleteSeed(value, this.props.tempAccount.password, lastSeedIndex);
            } else {
                error();
            }
        });
        this.props.navigator.pop({
            animated: false,
        });
        dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
        this.props.setFirstUse(false);
    }

    //UseExistingSeed method
    onExistingSeedNodeSuccess(accountName) {
        this.props.increaseSeedCount();
        this.props.addAccountName(accountName);
    }

    //EditAccountName method
    saveAccountName(accountName){
        const dropdown = DropdownHolder.getDropdown();
        let accountInfo = this.props.account.accountInfo;
        let accountNameArray = this.props.account.seedNames;
        let seedIndex = this.props.tempAccount.seedIndex;

        if(accountNameArray.includes(accountName)){
              dropdown.alertWithType(
                  'error',
                  'Account name already in use',
                  'This account name is already linked to your wallet. Please use a different one.',
              );
        } else {

            // Update keychain
            getFromKeychain(this.props.tempAccount.password, value => {
                if (typeof value != 'undefined' && value != null) {
                    let seeds = JSON.parse(value);
                    seeds[seedIndex].name = accountName;
                    replaceKeychainValue(this.props.tempAccount.password, seeds)
                }
            })

            const currentAccountName = accountNameArray[seedIndex];
            const keyMap = {[currentAccountName]: accountName};
            const newAccountInfo = renameKeys(accountInfo, keyMap);
            accountNameArray[seedIndex] = accountName;
            this.props.changeAccountName(newAccountInfo, accountNameArray);

            this.props.setSetting('accountManagement')
            dropdown.alertWithType(
                'success',
                'Account name changed',
                `Your account name has been changed.`,
            );
        }
    }

    //EditAccountName and ViewSeed method
    onWrongPassword(){
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType(
            'error',
            'Unrecognised password',
            'The password was not recognised. Please try again.',
        );
    }

    //DeleteAccount method
    deleteAccount(){
        const dropdown = DropdownHolder.getDropdown();

        let seedIndex = this.props.tempAccount.seedIndex;
        let accountNames = this.props.account.seedNames;
        let currentAccountName = accountNames[seedIndex];
        let accountInfo = this.props.account.accountInfo;

        let newAccountInfo = accountInfo;
        delete newAccountInfo[currentAccountName];
        accountNames.splice(seedIndex, 1);

        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                deleteSeed(value, this.props.tempAccount.password, seedIndex);
                this.props.setSeedIndex(0);
                this.props.removeAccount(newAccountInfo, accountNames);
                this.props.setSetting('accountManagement');
                dropdown.alertWithType(
                    'success',
                    'Account deleted',
                    `Your account has been removed from the wallet.`,
                );
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

    onDeleteAccountPress(){
        const dropdown = DropdownHolder.getDropdown();
        if(this.props.account.seedCount == 1){
            dropdown.alertWithType(
                'error',
                'Cannot perform action',
                'Go to advanced settings to reset the wallet.',
            );
        } else {
          this.props.setSetting('deleteAccount')
        }
    }

    onModePress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onCurrencyPress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onThemePress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onLanguagePress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    on2FASetupPress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onResetWalletPress() {
        this.props.navigator.push({
            screen: 'wallet-reset-confirm',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundImageName: 'bg-blue.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    onBackPress() {
        this.props.setSetting('mainSettings');
    }

    logout() {
        {
            /* this.props.logoutFromWallet() */
        }
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
        this._hideModal();
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

    onAccountManagementPress() {
        this.props.setSetting('accountManagement')
    }

    onAddNewSeedPress() {
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
        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={{flex:1}}/>
                    <View style={styles.settingsContainer}>{this._renderSettingsContent(this.props.tempAccount.currentSetting)}</View>
                    <View style={{flex:1}}/>
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
            </TouchableWithoutFeedback>
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
    subtitleText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        marginLeft: width / 12,
        width: width / 2.4,
        backgroundColor: 'transparent',
    },
    settingText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
        marginLeft: width / 30,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
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
        height: height / 3000,
        marginVertical: height / 100,
        alignSelf: 'center',
    },
});

const mapDispatchToProps = dispatch => ({
    logoutFromWallet: () => dispatch(logoutFromWallet()),
    clearTempData: () => dispatch(clearTempData()),
    setPassword: password => dispatch(setPassword(password)),
    setFirstUse: (boolean) => dispatch(setFirstUse(boolean)),
    getAccountInfoNewSeed: (seed, seedName, cb) => dispatch(getAccountInfoNewSeed(seed, seedName, cb)),
    increaseSeedCount: () => dispatch(increaseSeedCount()),
    addAccountName: (seedName) => dispatch(addAccountName(seedName)),
    setSetting: (setting) => dispatch(setSetting(setting)),
    changeAccountName: (newAccountName, accountNames, addresses, transfers) => dispatch(changeAccountName(newAccountName, accountNames, addresses, transfers)),
    removeAccount: (accountInfo, accountNames) => dispatch(removeAccount(accountInfo, accountNames)),
    setSeedIndex: (number) => dispatch(setSeedIndex(number)),
    setNode: (node) => dispatch(setNode(node)),
    getCurrencyData: (currency) => dispatch(getCurrencyData(currency)),
    setPassword: password => dispatch(setPassword(password)),
});

const mapStateToProps = state => ({
    account: state.account,
    settings: state.settings,
    tempAccount: state.tempAccount,
    settings: state.settings
});

Settings.propTypes = {
    account: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    logoutFromWallet: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
