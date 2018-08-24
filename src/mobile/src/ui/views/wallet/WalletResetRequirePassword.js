import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetWallet, setCompletedForcedPasswordUpdate } from 'shared-modules/actions/settings';
import { setFirstUse, setOnboardingComplete } from 'shared-modules/actions/accounts';
import { clearWalletData, setPassword } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, BackHandler } from 'react-native';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import { persistor } from 'libs/store';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import { clearKeychain, getPasswordHash } from 'libs/keychain';
import CustomTextInput from 'ui/components/CustomTextInput';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 3.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

/**
 * Wallet Reset Require Password screen component
 */
class WalletResetRequirePassword extends Component {
    static propTypes = {
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        resetWallet: PropTypes.func.isRequired,
        /** @ignore */
        setFirstUse: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        setCompletedForcedPasswordUpdate: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: '',
        };

        this.goBack = this.goBack.bind(this);
        this.resetWallet = this.resetWallet.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('WalletResetRequirePassword');
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
        const { theme: { body } } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    /**
     * Checks if password is correct
     * @method isAuthenticated
     */
    async isAuthenticated() {
        const { password } = this.props;
        const pwdHash = await getPasswordHash(this.state.password);
        return isEqual(password, pwdHash);
    }

    /**
     * Navigates to language setup screen
     * @method redirectToInitialScreen
     */
    redirectToInitialScreen() {
        const { theme: { body } } = this.props;

        this.props.navigator.resetTo({
            screen: 'languageSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    /**
     * Resets wallet's state
     * @method resetWallet
     */
    resetWallet() {
        const isAuthenticated = this.isAuthenticated();
        const { t } = this.props;

        if (isAuthenticated) {
            this.redirectToInitialScreen();
            persistor
                .purge()
                .then(() => clearKeychain())
                .then(() => {
                    this.props.setOnboardingComplete(false);
                    this.props.setFirstUse(true);
                    this.props.clearWalletData();
                    this.props.setPassword('');
                    this.props.resetWallet();
                    // FIXME: Temporarily needed for password migration
                    this.props.setCompletedForcedPasswordUpdate();
                })
                .catch(() => {
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongExplanation'),
                    );
                });
        } else {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    render() {
        const { t, theme } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midWrapper}>
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                containerStyle={{ width: width / 1.15 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                theme={theme}
                                secureTextEntry
                            />
                            <View style={{ flex: 0.2 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.resetWallet}
                                leftButtonText={t('global:cancel')}
                                rightButtonText={t('reset')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert textColor={theme.body.color} backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    resetWallet,
    setFirstUse,
    setOnboardingComplete,
    clearWalletData,
    setPassword,
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default translate(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
