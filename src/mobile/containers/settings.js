import React, { Component } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearIOTA } from '../../shared/actions/iotaActions';
import store from '../../shared/store';
import { persistStore } from 'redux-persist';
import Modal from 'react-native-modal';
import AddNewSeedModal from '../components/addNewSeedModal';

const { height, width } = Dimensions.get('window');

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            selectedSetting: 'addNewSeed',
            modalContent: <AddNewSeedModal />,
        };
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => <View style={styles.modalContent}>{this.state.modalContent}</View>;

    setModalContent(selectedSetting) {
        let modalContent;
        switch (selectedSetting) {
            case 'addNewSeed':
                modalContent = <AddNewSeedModal style={{ flex: 1 }} hideModal={() => this._hideModal()} />;
                break;
            case 'send':
                modalContent = <Send type={tabChoice} />;
                break;
            case 'receive':
                modalContent = <Receive type={tabChoice} />;
                break;
            case 'history':
                modalContent = <History type={tabChoice} />;
                break;
            case 'settings':
                modalContent = <Settings type={tabChoice} />;
                break;
            default:
                break;
        }
        this.setState({
            selectedSetting,
            modalContent,
        });
        this._showModal();
    }

    onModePress() {}

    onCurrencyPress() {}

    onThemePress() {}

    onLanguagePress() {}

    onChangePasswordPress() {}

    on2FASetupPress() {}

    onAddNewSeedPress() {}

    onAdvancedSettingsPress() {}

    onResetWalletPress() {}

    onLogoutPress() {
        this.props.clearIOTA();
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
                        <View style={styles.dividingItem}>
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
                        <View style={styles.dividingItem}>
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
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
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
    dividingItem: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.3,
        flexDirection: 'row',
        width: width / 1.16,
        paddingVertical: height / 40,
        alignItems: 'center',
        marginHorizontal: width / 15,
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
    },
    modalContent: {
        backgroundColor: '#16313a',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
});

const mapDispatchToProps = dispatch => ({
    clearIOTA: () => {
        dispatch(clearIOTA());
    },
});

const mapStateToProps = state => ({
    account: state.account,
    settings: state.settings,
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
