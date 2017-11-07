import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearTempData } from '../../shared/actions/tempAccount';
import store from '../../shared/store';
import Modal from 'react-native-modal';
import AddNewSeedModal from '../components/addNewSeedModal';
import { logoutFromWallet } from '../../shared/actions/app';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import DropdownHolder from '../components/dropdownHolder';

const { height, width } = Dimensions.get('window');

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            selectedSetting: 'addNewSeed',
            modalContent: <AddNewSeedModal />,
        };
        this.onChangePasswordPress = this.onChangePasswordPress.bind(this);
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    setModalContent(selectedSetting) {
        let modalContent;
        switch (selectedSetting) {
            case 'addNewSeed':
                modalContent = (
                    <AddNewSeedModal
                        style={{ flex: 1 }}
                        hideModal={() => this._hideModal()}
                        navigate={() => this.navigateToNewSeed()}
                    />
                );
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

    onCurrencyPress() {}

    onThemePress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onLanguagePress() {}

    onChangePasswordPress() {
        this.props.navigator.push({
            screen: 'change-password',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
        });
    }

    on2FASetupPress() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onAdvancedSettingsPress() {
        const dropdown = DropdownHolder.getDropdown();
        this.dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
    }

    onResetWalletPress() {
        this.props.navigator.push({
            screen: 'wallet-reset-confirm',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
        });
    }

    onLogoutPress() {
        {
            /* this.props.logoutFromWallet() */
        }
        this.props.clearTempData();
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundImageName: 'bg-green.png',
                    screenBackgroundColor: '#102e36',
                },
            },
        });
    }

    navigateToNewSeed() {
        this._hideModal();
        this.props.navigator.push({
            screen: 'addAdditionalSeed',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.settingsContainer}>
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
                    <TouchableOpacity onPress={event => this.setModalContent('addNewSeed')}>
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
                    <TouchableOpacity onPress={event => this.onAdvancedSettingsPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/advanced.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Advanced settings</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onResetWalletPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/reset.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Reset wallet</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onLogoutPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/logout.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Log out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: height / 13,
                        zIndex: 0,
                    }}
                >
                    <View style={styles.line1} />
                    <View style={styles.line2} />
                </View>
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
        width: width / 20,
        height: width / 20,
        marginRight: width / 25,
    },
    settingsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingBottom: height / 80,
        zIndex: 1,
    },
    modalContent: {
        backgroundColor: '#16313a',
        justifyContent: 'center',
    },
    line1: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.3,
        width: width / 1.16,
    },
    line2: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.3,
        width: width / 1.16,
        marginTop: height / 4.8,
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
});

const mapStateToProps = state => ({
    account: state.account,
    settings: state.settings,
});

Settings.propTypes = {
    account: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    logoutFromWallet: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
