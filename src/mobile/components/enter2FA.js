import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import THEMES from '../theme/themes';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
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
        paddingTop: height / 8,
    },
    title: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 7,
        width: width / 7,
    },
    loginButton: {
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class Enter2FA extends Component {
    static propTypes = {
        onLoginPress: PropTypes.func.isRequired,
        onLogin2FA: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        positiveColor: PropTypes.object.isRequired,
        isEnable2FA: PropTypes.bool.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.object.isRequired,
    };

    state = {
        codefor2FA: '',
        isEnable2FA: this.props.isEnable2FA,
    };

    handleChange2FA = codefor2FA => this.setState({ codefor2FA });

    handleLogin = () => {
        const { password } = this.state;
        const { onLoginPress } = this.props;
        onLoginPress(password);
    };

    handleLogin2FA = () => {
        const { codefor2FA } = this.state;
        const { onLogin2FA } = this.props;
        onLogin2FA(codefor2FA);
    };

    render() {
        const { codefor2FA } = this.state;
        const { t, positiveColor, secondaryBackgroundColor, negativeColor } = this.props;
        const borderColor = { borderColor: THEMES.getHSL(positiveColor) };
        const textColor = { color: THEMES.getHSL(positiveColor) };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Please enter your 2FA Token:</Text>
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
                            label="2FA Code"
                            tintColor={THEMES.getHSL(negativeColor)}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            value={codefor2FA}
                            onChangeText={this.handleChange2FA}
                            containerStyle={{
                                width: width / 1.4,
                            }}
                            onSubmitEditing={this.handleLogin2FA}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={this.handleLogin2FA}>
                            <View style={[styles.loginButton, borderColor]}>
                                <Text style={[styles.loginText, textColor]}>{t('login')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Enter2FA;
