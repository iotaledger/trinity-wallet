import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Styling } from 'ui/theme/general';
import { TWOFA_TOKEN_LENGTH } from 'shared-modules/libs/utils';
import CustomTextInput from './CustomTextInput';
import DualFooterButtons from './DualFooterButtons';

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
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Cancel two factor authentication */
        cancel: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        token: '',
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('Enter2FA');
    }

    componentWillUpdate(newProps, newState) {
        const { token } = this.state;
        if (token.length !== TWOFA_TOKEN_LENGTH && newState.token.length === TWOFA_TOKEN_LENGTH) {
            this.props.verify(newState.token);
        }
    }

    handleChange2FAToken = (token) => this.setState({ token });

    handleDonePress = () => {
        const { token } = this.state;
        this.props.verify(token);
    };

    handleBackPress = () => {
        this.props.cancel();
    };

    render() {
        const { token } = this.state;
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
                            onValidTextChange={this.handleChange2FAToken}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.handleDonePress}
                            theme={theme}
                            value={token}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <DualFooterButtons
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

export default withNamespaces(['twoFA', 'global'])(Enter2FA);
