import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import {
    increaseSeedCount,
    addAccountName,
    setOnboardingComplete,
    setBasicAccountInfo,
} from 'shared-modules/actions/accounts';
import { clearWalletData, clearSeed, setPassword } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import {
    hasDuplicateSeed,
    hasDuplicateAccountName,
    storeSeedInKeychain,
    getAllSeedsFromKeychain,
    storeSaltInKeychain,
} from 'libs/keychain';
import { generatePasswordHash, getSalt } from 'libs/crypto';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import { isAndroid } from 'libs/device';
import { width, height } from 'libs/dimensions';
import InfoBox from 'ui/components/InfoBox';
import { Icon } from 'ui/theme/icons';
import GENERAL from 'ui/theme/general';
import Header from 'ui/components/Header';
import PasswordFields from 'ui/components/PasswordFields';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

console.ignoredYellowBox = ['Native TextInput']; // eslint-disable-line no-console

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3,
        justifyContent: 'space-around',
        alignItems: 'center',
        width,
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
});

/** Set Password component */
class SetPassword extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        clearSeed: PropTypes.func.isRequired,
        /** @ignore */
        increaseSeedCount: PropTypes.func.isRequired,
        /** @ignore */
        addAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        setBasicAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        usedExistingSeed: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: '',
            reentry: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SetPassword');
    }

    /**
     * Validates correct password hash and checks for duplicate seed/account name
     * @method onAcceptPassword
     * @returns {Promise<void>}
     */
    async onAcceptPassword() {
        const { t, seed, accountName } = this.props;
        const salt = await getSalt();
        const pwdHash = await generatePasswordHash(this.state.password, salt);
        getAllSeedsFromKeychain(pwdHash).then((seedInfo) => {
            if (hasDuplicateAccountName(seedInfo, accountName)) {
                return this.props.generateAlert(
                    'error',
                    t('addAdditionalSeed:nameInUse'),
                    t('addAdditionalSeed:nameInUseExplanation'),
                );
            } else if (hasDuplicateSeed(seedInfo, seed)) {
                return this.props.generateAlert(
                    'error',
                    t('addAdditionalSeed:seedInUse'),
                    t('addAdditionalSeed:seedInUseExplanation'),
                );
            }
            return this.onAcceptInKeychain(pwdHash, salt, seed, accountName);
        });
    }

    /**
     * Stores seed in keychain and clears seed from state
     * @method onAcceptInKeychain
     * @returns {Promise<void>}
     */
    onAcceptInKeychain(pwdHash, salt, seed, accountName) {
        const { t, usedExistingSeed } = this.props;
        storeSeedInKeychain(pwdHash, seed, accountName)
            .then(async () => {
                await storeSaltInKeychain(salt);
                this.props.setPassword(pwdHash);
                this.props.addAccountName(accountName);
                this.props.setBasicAccountInfo({ accountName, usedExistingSeed });
                this.props.increaseSeedCount();
                this.props.clearWalletData();
                this.props.clearSeed();
                this.props.setOnboardingComplete(true);
                this.navigateToOnboardingComplete();
            })
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongRestart'),
                ),
            );
    }

    /**
     * Triggers password validation
     * @method onDonePress
     */
    onDonePress() {
        this.passwordFields.checkPassword();
    }

    /**
     * Pops the active screen from the navigation stack
     * @method onBackPress
     */
    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    navigateToOnboardingComplete() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'onboardingComplete',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
            animated: false,
        });
    }

    renderContent() {
        const { t, theme: { body } } = this.props;
        const { password, reentry } = this.state;
        return (
            <View>
                <TouchableWithoutFeedback style={{ flex: 1, width }} onPress={Keyboard.dismiss} accessible={false}>
                    <View style={[styles.container, { backgroundColor: body.bg }]}>
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={body.color}>{t('choosePassword')}</Header>
                        </View>
                        <View style={styles.midContainer}>
                            <InfoBox
                                body={body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, { color: body.color }]}>
                                            {t('anEncryptedCopy')}
                                        </Text>
                                        <Text style={[styles.warningText, { color: body.color }]}>
                                            {t('changePassword:ensureStrongPassword')}
                                        </Text>
                                    </View>
                                }
                            />
                            <View style={{ flex: 0.2 }} />
                            <PasswordFields
                                onRef={(ref) => {
                                    this.passwordFields = ref;
                                }}
                                onAcceptPassword={() => this.onAcceptPassword()}
                                password={password}
                                reentry={reentry}
                                setPassword={(password) => this.setState({ password })}
                                setReentry={(reentry) => this.setState({ reentry })}
                            />
                            <View style={{ flex: 0.3 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:done')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }

    render() {
        const { theme: { body } } = this.props;
        return (
            <View style={styles.container}>
                {isAndroid ? (
                    <KeyboardAvoidingView style={styles.container}>{this.renderContent()}</KeyboardAvoidingView>
                ) : (
                    <KeyboardAwareScrollView
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.container}
                        scrollEnabled={false}
                        enableOnAndroid={false}
                    >
                        {this.renderContent()}
                    </KeyboardAwareScrollView>
                )}
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    accountName: state.wallet.accountName,
    usedExistingSeed: state.wallet.usedExistingSeed,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setOnboardingComplete,
    clearWalletData,
    clearSeed,
    increaseSeedCount,
    addAccountName,
    generateAlert,
    setPassword,
    setBasicAccountInfo,
};

export default translate(['setPassword', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword),
);
