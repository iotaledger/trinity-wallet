import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import whiteIotaImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';
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
    doneButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    doneText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class Enter2FA extends Component {
    static propTypes = {
        onComplete2FA: PropTypes.func.isRequired,
        positiveColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.object.isRequired,
        onBackPress: PropTypes.func.isRequired,
    };

    state = {
        token2FA: '',
    };

    handleChange2FAToken = (token2FA) => this.setState({ token2FA });

    handleDonePress = () => {
        const { token2FA } = this.state;
        const { onComplete2FA } = this.props;
        onComplete2FA(token2FA);
    };

    handleBackPress = () => {
        const { onBackPress } = this.props;
        onBackPress();
    };

    render() {
        const { codefor2FA } = this.state;
        const { positiveColor, secondaryBackgroundColor, negativeColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const iotaLogoImagePath = secondaryBackgroundColor === 'white' ? whiteIotaImagePath : blackIotaImagePath;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Image source={iotaLogoImagePath} style={styles.iotaLogo} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>Please enter your 2FA Token</Text>
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
                            label="Token"
                            tintColor={THEMES.getHSL(negativeColor)}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            value={codefor2FA}
                            onChangeText={this.handleChange2FAToken}
                            containerStyle={{
                                width: width / 1.4,
                            }}
                            onSubmitEditing={this.handleDonePress}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.handleBackPress}
                            onRightButtonPress={this.handleDonePress}
                            leftText={'BACK'}
                            rightText={'DONE'}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Enter2FA;
