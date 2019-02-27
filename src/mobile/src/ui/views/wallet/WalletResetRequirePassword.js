import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import { resetWallet, setCompletedForcedPasswordUpdate } from 'shared-modules/actions/settings';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { reinitialise as reinitialiseStorage } from 'shared-modules/storage';
import { getEncryptionKey } from 'libs/realm';
import { Text, StyleSheet, View, Keyboard, TouchableWithoutFeedback, BackHandler } from 'react-native';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { clearKeychain, hash } from 'libs/keychain';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import Header from 'ui/components/Header';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midWrapper: {
        flex: 4.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/**
 * Wallet Reset Require Password screen component
 */
class WalletResetRequirePassword extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        resetWallet: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setCompletedForcedPasswordUpdate: PropTypes.func.isRequired,
        /** @ignore */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** Determines whether to allow account change */
        shouldPreventAction: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: null,
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
        delete this.state.password;
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Checks if password is correct
     * @method isAuthenticated
     */
    async isAuthenticated() {
        return isEqual(global.passwordHash, await hash(this.state.password));
    }

    /**
     * Navigates to language setup screen
     * @method redirectToInitialScreen
     */
    redirectToInitialScreen() {
        const { theme: { body } } = this.props;
        navigator.setStackRoot('languageSetup', {
            animations: {
                push: {
                    enable: false,
                },
            },
            layout: {
                backgroundColor: body.bg,
                orientation: ['portrait'],
            },
            statusBar: {
                backgroundColor: body.bg,
            },
        });
    }

    /**
     * Resets wallet's state
     * @method resetWallet
     */
    async resetWallet() {
        const { t } = this.props;
        const { isAutoPromoting, shouldPreventAction } = this.props;
        if (isAutoPromoting || shouldPreventAction) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        if (isEmpty(this.state.password)) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        } else if (await this.isAuthenticated()) {
            reinitialiseStorage(getEncryptionKey)
                .then(() => clearKeychain())
                .then(() => {
                    this.redirectToInitialScreen();
                    // resetWallet action creator resets the whole state object to default values
                    // https://github.com/iotaledger/trinity-wallet/blob/develop/src/shared/store.js#L37
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
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={400}
                            >
                                <Header textColor={theme.body.color} />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midWrapper}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={300}
                            >
                                <InfoBox>
                                    <Text style={[styles.infoText, { color: theme.body.color }]}>
                                        {t('enterPassword')}
                                    </Text>
                                </InfoBox>
                            </AnimatedComponent>
                            <View style={{ flex: 0.1 }} />
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={100}
                            >
                                <CustomTextInput
                                    label={t('global:password')}
                                    onValidTextChange={(password) => this.setState({ password })}
                                    value={this.state.password}
                                    containerStyle={{ width: Styling.contentWidth }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    theme={theme}
                                    secureTextEntry
                                    isPasswordInput
                                />
                            </AnimatedComponent>
                            <View style={{ flex: 0.1 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                                <DualFooterButtons
                                    onLeftButtonPress={this.goBack}
                                    onRightButtonPress={this.resetWallet}
                                    leftButtonText={t('global:cancel')}
                                    rightButtonText={t('reset')}
                                />
                            </AnimatedComponent>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    shouldPreventAction: shouldPreventAction(state),
    isAutoPromoting: state.polling.isAutoPromoting,
});

const mapDispatchToProps = {
    resetWallet,
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default withNamespaces(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
