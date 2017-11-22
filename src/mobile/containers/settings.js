import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearTempData, setPassword } from '../../shared/actions/tempAccount';
import store from '../../shared/store';
import Modal from 'react-native-modal';
import AddNewSeedModal from '../components/addNewSeedModal';
import LogoutConfirmationModal from '../components/logoutConfirmationModal.js';
import { logoutFromWallet } from '../../shared/actions/app';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import DropdownHolder from '../components/dropdownHolder';

const width = Dimensions.get('window').width;
const height = global.height;

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            selectedSetting: 'addNewSeed',
            modalContent: <AddNewSeedModal />,
            settings: true,
        };
        this.onChangePasswordPress = this.onChangePasswordPress.bind(this);
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    _renderSettingsContent = boolean => {
        if (boolean) {
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
                    <TouchableOpacity onPress={event => this.onCurrencyPress()}>
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
                    <TouchableOpacity onPress={event => this.onAddNewSeedPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/add.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Add new seed</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.on2FASetupPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/2fa.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Two-factor authentication</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onChangePasswordPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/password.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Change password</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity onPress={event => this.onAdvancedSettingsPress()}>
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
        } else {
            return (
                <View style={styles.advancedSettingsContainer}>
                    <TouchableOpacity onPress={event => this.onResetWalletPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/reset.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Reset Wallet</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onBackPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Back</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    setModalContent(selectedSetting) {
        let modalContent;
        switch (selectedSetting) {
            case 'addNewSeed':
                modalContent = (
                    <AddNewSeedModal
                        style={{ flex: 1 }}
                        hideModal={() => this._hideModal()}
                        navigateNewSeed={() => this.navigateNewSeed()}
                        navigateExistingSeed={() => this.navigateExistingSeed()}
                    />
                );
                break;
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
            selectedSetting,
            modalContent,
        });
        this._showModal();
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

    onChangePasswordPress() {
        this.props.navigator.push({
            screen: 'change-password',
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

    on2FASetupPress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onAdvancedSettingsPress() {
        this.setState({ settings: false });
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
        this.setState({ settings: true });
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

    navigateExistingSeed() {
        this._hideModal();
        this.props.navigator.push({
            screen: 'addAdditionalSeed',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
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
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.settingsContainer}>{this._renderSettingsContent(this.state.settings)}</View>
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
        paddingTop: height / 60,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingVertical: height / 22,
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
        alignSelf: 'center',
    },
});

const mapDispatchToProps = dispatch => ({
    logoutFromWallet: () => dispatch(logoutFromWallet()),
    clearTempData: () => dispatch(clearTempData()),
    setPassword: password => dispatch(setPassword(password)),
});

const mapStateToProps = state => ({
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
