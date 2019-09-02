import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import navigator from 'libs/navigation';
import { resetWallet, setCompletedForcedPasswordUpdate } from 'shared-modules/actions/settings';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { reinitialise as reinitialiseStorage } from 'shared-modules/storage';
import getEncryptionKey from 'libs/realm';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, BackHandler } from 'react-native';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { clearKeychain } from 'libs/keychain';
import { getAnimation } from 'shared-modules/animations';
import LottieView from 'lottie-react-native';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 5.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    animation: {
        width: width / 1.35,
        height: width / 1.35,
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
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    constructor() {
        super();
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
        navigator.pop(this.props.componentId);
    }

    /**
     * Navigates to language setup screen
     * @method redirectToInitialScreen
     */
    redirectToInitialScreen() {
        navigator.setStackRoot('languageSetup');
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
            .catch((err) => {
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongExplanation'),
                    10000,
                    err,
                );
            });
    }

    render() {
        const { t, theme, themeName } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };

        return (
            <View style={[styles.container, backgroundColor]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topWrapper}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={100}
                            >
                                <LottieView
                                    source={getAnimation('logout', themeName)}
                                    loop={false}
                                    autoPlay
                                    style={styles.animation}
                                />
                            </AnimatedComponent>
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
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    resetWallet,
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default withNamespaces(['resetWalletRequirePassword', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(WalletResetRequirePassword),
);
