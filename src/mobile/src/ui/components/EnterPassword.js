import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { connect } from 'react-redux';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Styling } from 'ui/theme/general';
import SingleFooterButton from './SingleFooterButton';
import CustomTextInput from './CustomTextInput';

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
        paddingTop: height / 5,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

/** Enter password component */
class EnterPassword extends Component {
    static propTypes = {
        /** Press event callback function
         * @param {string} password
         */
        onLoginPress: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Set application activity state to active = true */
        setUserActive: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: '',
        };
        this.activateFingerprintScanner = this.activateFingerprintScanner.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EnterPassword');
        if (this.props.isFingerprintEnabled) {
            this.activateFingerprintScanner();
        }
    }

    componentWillUnmount() {
        if (isAndroid) {
            FingerprintScanner.release();
        }
    }

    /**
     * Wrapper method for onLoginPress prop method
     *
     * @method handleLogin
     */
    handleLogin = () => {
        const { onLoginPress } = this.props;
        const { password } = this.state;
        onLoginPress(password);
    };

    /**
     * Activates fingerprint authentication
     *
     * @method activateFingerprintScanner
     */
    activateFingerprintScanner() {
        const { t } = this.props;
        if (isAndroid) {
            this.showModal();
        }
        FingerprintScanner.authenticate({ description: t('fingerprintSetup:instructionsLogin') })
            .then(() => {
                if (isAndroid) {
                    this.hideModal();
                }
                this.props.setUserActive();
            })
            .catch(() => {
                this.props.generateAlert(
                    'error',
                    t('fingerprintSetup:fingerprintAuthFailed'),
                    t('fingerprintSetup:fingerprintAuthFailedExplanation'),
                );
            });
    }

    hideModal() {
        this.props.toggleModalActivity();
    }

    showModal() {
        const { theme } = this.props;
        this.props.toggleModalActivity('fingerprint', {
            hideModal: () => this.props.toggleModalActivity(),
            theme,
            instance: 'login',
        });
    }

    render() {
        const { t, theme, isFingerprintEnabled } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onChangeText={(text) => this.setState({ password: text })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            widget="fingerprint"
                            fingerprintAuthentication={isFingerprintEnabled}
                            onFingerprintPress={this.activateFingerprintScanner}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SingleFooterButton onButtonPress={this.handleLogin} buttonText={t('login')} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    toggleModalActivity,
};

export default withNamespaces(['login', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterPassword));
