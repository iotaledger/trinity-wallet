import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from './OnboardingButtons';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    topContainer: {
        flex: 2.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3.6,
        width,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
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
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
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
        const { secondaryBackgroundColor, negativeColor } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={secondaryBackgroundColor} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label="2FA Token"
                            onChangeText={this.handleChange2FAToken}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.handleDonePress}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            value={codefor2FA}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.handleBackPress}
                            onRightButtonPress={this.handleDonePress}
                            leftText="BACK"
                            rightText="DONE"
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Enter2FA;
