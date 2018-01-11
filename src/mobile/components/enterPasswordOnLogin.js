import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import THEMES from '../theme/themes';
import { width, height } from '../util/dimensions';
import OnboardingButtons from '../components/onboardingButtons';

const styles = StyleSheet.create({
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 4.8,
        width,
        alignItems: 'center',
        paddingTop: height / 4.2,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
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

class EnterPasswordOnLogin extends Component {
    state = {
        password: '',
    };

    handleChangeText = password => this.setState({ password });

    handleLogin = () => {
        const { password } = this.state;
        const { onLoginPress } = this.props;
        onLoginPress(password);
    };

    changeNode = () => {
        const { navigateToNodeSelection } = this.props;
        navigateToNodeSelection();
    };

    render() {
        const { password } = this.state;
        const { t, textColor, secondaryBackgroundColor, negativeColor } = this.props;
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>{t('enterPassword')}</Text>
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        <TextField
                            style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                            labelFontSize={width / 31.8}
                            fontSize={width / 20.7}
                            labelPadding={3}
                            baseColor={secondaryBackgroundColor}
                            label={t('global:password')}
                            tintColor={THEMES.getHSL(negativeColor)}
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
                        <OnboardingButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftText={'SET NODE'}
                            rightText={t('login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

EnterPasswordOnLogin.propTypes = {
    onLoginPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    positiveColor: PropTypes.object.isRequired,
    textColor: PropTypes.object.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
    negativeColor: PropTypes.object.isRequired,
};

export default translate(['login', 'global'])(EnterPasswordOnLogin);
