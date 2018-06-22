import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import RNExitApp from 'react-native-exit-app';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
import CustomTextInput from './CustomTextInput';
import { Icon } from '../theme/icons.js';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

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
        leaveNavigationBreadcrumb('EnterPasswordOnLogin');
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
                            containerStyle={{ width: width / 1.15 }}
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
