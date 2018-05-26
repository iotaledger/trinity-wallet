import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import RNExitApp from 'react-native-exit-app';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
import CustomTextInput from './CustomTextInput';
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
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 8,
    },
    title: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    loginButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    loginText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
});

export class EnterPasswordOnLogin extends Component {
    static propTypes = {
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Password text */
        password: PropTypes.string.isRequired,
        /** Verify two factor authentication token */
        /** @param {string} password - user's password */
        onLoginPress: PropTypes.func.isRequired,
        /** Navigate to node selection screen */
        navigateToNodeOptions: PropTypes.func.isRequired,
        /** Set updated text field password */
        /** @param {string} password - Updated password in the text field */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        BackHandler.addEventListener('loginBackPress', () => {
            RNExitApp.exitApp();
            return true;
        });
    }

    handleChangeText = (password) => this.props.setLoginPasswordField(password);

    handleLogin = () => {
        const { onLoginPress, password } = this.props;
        onLoginPress(password);
    };

    changeNode = () => {
        const { navigateToNodeOptions } = this.props;
        navigateToNodeOptions();
    };

    render() {
        const { t, theme, password } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onChangeText={this.handleChangeText}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            value={password}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftButtonText={t('setNode')}
                            rightButtonText={t('login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['login', 'global'])(EnterPasswordOnLogin);
