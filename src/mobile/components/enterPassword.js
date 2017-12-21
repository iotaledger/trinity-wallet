import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

import COLORS from '../theme/Colors';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        paddingTop: height / 4.2,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    loginButton: {
        borderColor: COLORS.greenLighter,
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        color: COLORS.greenLighter,
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class EnterPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
        };
    }

    render() {
        const { password } = this.state;
        const { t } = this.props;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{t('enterPassword')}</Text>
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        <TextField
                            style={{ color: 'white', fontFamily: 'Lato-Light' }}
                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                            labelFontSize={width / 31.8}
                            fontSize={width / 20.7}
                            labelPadding={3}
                            baseColor="white"
                            label={t('global:password')}
                            tintColor="#F7D002"
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            value={password}
                            onChangeText={this.handleChangeText}
                            containerStyle={{
                                width: width / 1.4,
                            }}
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={this.handleLogin}>
                            <View style={styles.loginButton}>
                                <Text style={styles.loginText}>{t('login')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    handleChangeText = password => this.setState({ password });

    handleLogin = () => {
        const { password } = this.state;
        const { onLoginPress } = this.props;
        onLoginPress(password);
    };

    clearPassword = () => this.setState({ password: '' });
}

EnterPassword.propTypes = {
    onLoginPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default translate(['login', 'global'])(EnterPassword);
