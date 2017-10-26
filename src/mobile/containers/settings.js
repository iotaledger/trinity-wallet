import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearIOTA } from '../../shared/actions/iotaActions';

const { height, width } = Dimensions.get('window');

class Settings extends Component {
    constructor() {
        super();

        this.onChangePasswordPress = this.onChangePasswordPress.bind(this);
    }
    onChangeModePress() {}

    onChangeThemePress() {}

    onChangeLanguagePress() {}

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
                    <TouchableOpacity onPress={event => this.onChangeModePress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/mode.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Change mode</Text>
                            <Text style={styles.settingText}>{this.props.settings.mode}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onChangeThemePress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/theme.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Change theme</Text>
                            <Text style={styles.settingText}>{this.props.settings.theme}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onChangeLanguagePress()}>
                        <View style={styles.dividingItem}>
                            <Image source={require('../../shared/images/language.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Change language</Text>
                            <Text style={styles.settingText}>{this.props.settings.language}</Text>
                        </View>
                    </TouchableOpacity>
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
                    <TouchableOpacity onPress={this.onChangePasswordPress}>
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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: height / 18,
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
        fontSize: width / 23,
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
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 40,
        justifyContent: 'center',
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
        paddingHorizontal: width / 15,
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

Settings.propTypes = {
    account: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    clearIOTA: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
