import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { increaseSeedCount, addAccountName, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/accounts';
import { clearWalletData, clearSeed, setPassword } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import CustomTextInput from '../components/CustomTextInput';
import {
    hasDuplicateSeed,
    hasDuplicateAccountName,
    storeSeedInKeychain,
    getAllSeedsFromKeychain,
} from '../utils/keychain';
import { getPasswordHash } from '../utils/crypto';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { isAndroid } from '../utils/device';
import { width, height } from '../utils/dimensions';
import InfoBox from '../components/InfoBox';
import { Icon } from '../theme/icons.js';

const MIN_PASSWORD_LENGTH = 12;
console.ignoredYellowBox = ['Native TextInput'];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3.7,
        justifyContent: 'space-around',
        alignItems: 'center',
        width,
    },
    textfieldsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'justify',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
});

/** Set Password component */
class SetPassword extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Sets wallet's onboarding status
         * @param {boolean} - status
         */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** Clears wallet reducer data */
        clearWalletData: PropTypes.func.isRequired,
        /** Wipes seed from reducer */
        clearSeed: PropTypes.func.isRequired,
        /** Increment number of seeds stored on device */
        increaseSeedCount: PropTypes.func.isRequired,
        /** Add account name to the list of account names stored on device
         * @param {string} - accountName
         */
        addAccountName: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        accountName: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: '',
            reentry: '',
        };
    }

    onDonePress() {
        const { theme: { body } } = this.props;
        const ifNoKeychainDuplicates = (pwdHash, seed, accountName) => {
            storeSeedInKeychain(pwdHash, seed, accountName)
                .then(() => {
                    this.props.setPassword(pwdHash);
                    this.props.addAccountName(accountName);
                    this.props.increaseSeedCount();
                    this.props.clearWalletData();
                    this.props.clearSeed();
                    this.props.setOnboardingComplete(true);
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
                })
                .catch(() => {
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongRestart'),
                    );
                });
        };

        const { t, seed, accountName } = this.props;
        const { password, reentry } = this.state;

        if (password.length >= MIN_PASSWORD_LENGTH && password === reentry) {
            const pwdHash = getPasswordHash(password);

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
                return ifNoKeychainDuplicates(pwdHash, seed, accountName);
            });
        } else if (!(password === reentry)) {
            this.props.generateAlert('error', t('passwordMismatch'), t('passwordMismatchExplanation'));
        } else if (password.length < MIN_PASSWORD_LENGTH || reentry.length < MIN_PASSWORD_LENGTH) {
            this.props.generateAlert(
                'error',
                t('passwordTooShort'),
                t('passwordTooShortExplanation', {
                    minLength: MIN_PASSWORD_LENGTH,
                    currentLength: password.length,
                }),
            );
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    renderContent() {
        const { t, theme } = this.props;
        const { password } = this.state;

        return (
            <View>
                <TouchableWithoutFeedback style={{ flex: 1, width }} onPress={Keyboard.dismiss} accessible={false}>
                    <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.8 }} />
                            <InfoBox
                                body={theme.body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, { color: theme.body.color }]}>
                                            {t('anEncryptedCopy')}
                                        </Text>
                                        <Text style={[styles.warningText, { color: theme.body.color }]}>
                                            {t('ensure')}
                                        </Text>
                                    </View>
                                }
                            />
                            <View style={{ flex: 0.2 }} />
                            <CustomTextInput
                                label={t('global:password')}
                                onChangeText={(password) => this.setState({ password })}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    if (password) {
                                        this.reentry.focus();
                                    }
                                }}
                                secureTextEntry
                                testID="setPassword-passwordbox"
                                theme={theme}
                            />
                            <View style={{ flex: 0.2 }} />
                            <CustomTextInput
                                onRef={(c) => {
                                    this.reentry = c;
                                }}
                                label={t('retypePassword')}
                                onChangeText={(reentry) => this.setState({ reentry })}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.onDonePress()}
                                secureTextEntry
                                testID="setPassword-reentrybox"
                                theme={theme}
                            />
                            <View style={{ flex: 0.3 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={t('global:back')}
                                rightText={t('global:done')}
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
                    <View style={styles.container}>{this.renderContent()}</View>
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
};

export default translate(['setPassword', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword),
);
