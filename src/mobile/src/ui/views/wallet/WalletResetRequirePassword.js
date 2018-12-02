import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import { resetWallet, setCompletedForcedPasswordUpdate } from 'shared-modules/actions/settings';
import { generateAlert } from 'shared-modules/actions/alerts';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, BackHandler } from 'react-native';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { persistConfig } from 'libs/store';
import { purgeStoredState } from 'shared-modules/store';
import { clearKeychain, hash } from 'libs/keychain';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
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
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
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
        Navigation.pop(this.props.componentId);
    }

    /**
     * Checks if password is correct
     * @method isAuthenticated
     */
    async isAuthenticated() {
        const { password } = this.props;
        const pwdHash = await hash(this.state.password);
        return isEqual(password, pwdHash);
    }

    /**
     * Navigates to language setup screen
     * @method redirectToInitialScreen
     */
    redirectToInitialScreen() {
        const { theme: { body } } = this.props;
        Navigation.setStackRoot('appStack', {
            component: {
                name: 'languageSetup',
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
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Resets wallet's state
     * @method resetWallet
     */
    async resetWallet() {
        const { t } = this.props;
        if (await this.isAuthenticated()) {
            this.redirectToInitialScreen();
            purgeStoredState(persistConfig)
                .then(() => clearKeychain())
                .then(() => {
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
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midWrapper}>
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                containerStyle={{ width: Styling.contentWidth }}
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
                            <DualFooterButtons
                                onLeftButtonPress={this.goBack}
                                onRightButtonPress={this.resetWallet}
                                leftButtonText={t('global:cancel')}
                                rightButtonText={t('reset')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
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
    generateAlert,
    setCompletedForcedPasswordUpdate,
};

export default withNamespaces(['resetWalletRequirePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(WalletResetRequirePassword),
);
