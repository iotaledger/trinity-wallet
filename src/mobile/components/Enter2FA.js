import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { translate } from 'react-i18next';
import CustomTextInput from '../components/CustomTextInput';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
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

export class Enter2FA extends Component {
    static propTypes = {
        /** Verify two factor authentication token */
        /** @param {string} token - 2fa token */
        verify: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Cancel two factor authentication */
        cancel: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        token2FA: '',
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('Enter2FA');
    }

    componentWillUpdate(newProps, newState) {
        const { token2FA } = this.state;
        if (token2FA.length === 5 && newState.token2FA.length === 6) {
            this.props.verify(newState.token2FA);
        }
    }

    handleChange2FAToken = (token2FA) => this.setState({ token2FA });

    handleDonePress = () => {
        const { token2FA } = this.state;
        this.props.verify(token2FA);
    };

    handleBackPress = () => {
        this.props.cancel();
    };

    render() {
        const { codefor2FA } = this.state;
        const { t, theme } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('twoFaToken')}
                            onChangeText={this.handleChange2FAToken}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.handleDonePress}
                            theme={theme}
                            value={codefor2FA}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.handleBackPress}
                            onRightButtonPress={this.handleDonePress}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('login:login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['twoFA', 'global'])(Enter2FA);
