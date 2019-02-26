import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { width } from 'libs/dimensions';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Styling } from 'ui/theme/general';
import CustomTextInput from './CustomTextInput';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    topContainer: {
        flex: 2.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Password text */
        password: PropTypes.object,
        /** Verify two factor authentication token */
        /** @param {object} password - user's password */
        onLoginPress: PropTypes.func.isRequired,
        /** Navigate to node selection screen */
        navigateToNodeOptions: PropTypes.func.isRequired,
        /** @ignore */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EnterPasswordOnLogin');
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

    openModal() {
        const { theme, t } = this.props;
        this.props.toggleModalActivity('biometricInfo', {
            theme,
            t,
            hideModal: () => this.props.toggleModalActivity(),
        });
    }

    hideModal() {
        this.props.toggleModalActivity();
    }

    render() {
        const { t, theme, password, isFingerprintEnabled } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Header textColor={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onValidTextChange={this.handleChangeText}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            value={password}
                            widget="fingerprintDisabled"
                            fingerprintAuthentication={isFingerprintEnabled}
                            onFingerprintPress={this.openModal}
                            isPasswordInput
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <DualFooterButtons
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

const mapDispatchToProps = {
    toggleModalActivity,
};

export default withNamespaces(['login', 'global'])(connect(null, mapDispatchToProps)(EnterPasswordOnLogin));
