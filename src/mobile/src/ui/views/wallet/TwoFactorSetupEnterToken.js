import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'shared-modules/actions/settings';
import { generateAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { withNamespaces } from 'react-i18next';
import CustomTextInput from 'ui/components/CustomTextInput';
import Fonts from 'ui/theme/fonts';
import { getTwoFactorAuthKeyFromKeychain } from 'libs/keychain';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
        width,
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
});

/** Two factor authentication token verification component */
class TwoFactorSetupEnterToken extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        set2FAStatus: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.check2FA = this.check2FA.bind(this);

        this.state = {
            code: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('TwoFactorSetupEnterToken');
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        Navigation.pop(this.props.componentId);
    }

    /**
     * Navigates to home screen
     * @method navigateToHome
     */
    navigateToHome() {
        const { theme: { body, bar } } = this.props;
        Navigation.setStackRoot('appStack', {
            component: {
                name: 'home',
                options: {
                    animations: {
                        setStackRoot: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: bar.alt,
                    },
                },
            },
        });
    }

    /**
     * Verifies user provided token and enables two factor authentication
     * @method check2FA
     */
    check2FA() {
        const { t, password } = this.props;
        getTwoFactorAuthKeyFromKeychain(password).then((key) => {
            if (key === null) {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                );
            }
            const verified = authenticator.verifyToken(key, this.state.code);

            if (verified) {
                this.props.set2FAStatus(true);
                this.navigateToHome();

                this.timeout = setTimeout(() => {
                    this.props.generateAlert('success', t('twoFAEnabled'), t('twoFAEnabledExplanation'));
                }, 300);
            } else {
                this.props.generateAlert('error', t('wrongCode'), t('wrongCodeExplanation'));
            }
        });
    }

    render() {
        const { theme, t } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <View style={styles.topWrapper}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{t('enterCode')}</Text>
                        <CustomTextInput
                            label={t('code')}
                            onChangeText={(code) => this.setState({ code })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.check2FA}
                            theme={theme}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.bottomWrapper}>
                        <DualFooterButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.check2FA}
                            leftButtonText={t('global:back')}
                            rightButtonText={t('global:done')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    set2FAStatus,
    generateAlert,
};

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    password: state.wallet.password,
});

export default withNamespaces(['twoFA', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken),
);
