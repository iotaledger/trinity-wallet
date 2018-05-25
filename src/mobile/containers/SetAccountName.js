import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback, Clipboard } from 'react-native';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setAccountName, setAdditionalAccountInfo } from 'iota-wallet-shared-modules/actions/wallet';
import { connect } from 'react-redux';
import { shouldPreventAction } from 'iota-wallet-shared-modules/selectors/global';
import DynamicStatusBar from '../components/DynamicStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import OnboardingButtons from '../containers/OnboardingButtons';
import { width, height } from '../utils/dimensions';
import { hasDuplicateAccountName, hasDuplicateSeed, getAllSeedsFromKeychain } from '../utils/keychain';
import InfoBox from '../components/InfoBox';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';

console.ignoredYellowBox = true;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 4.8,
        justifyContent: 'space-around',
        alignItems: 'center',
        width,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
});

/** Set Account Name component */
export class SetAccountName extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Set account name
         * @param {string} accountName
         */
        setAccountName: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set additional account information in store
         * @param {object} info - (addingAdditionalAccount, additionalAccountName)
         */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Determines whether onboarding steps for wallet setup are completed */
        onboardingComplete: PropTypes.bool.isRequired,
        /** Total number of accounts in the wallet */
        seedCount: PropTypes.number.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        shouldPreventAction: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: this.getDefaultAccountName(),
        };
    }

    componentDidMount() {
        const { t } = this.props;
        Clipboard.setString(' ');
        this.props.generateAlert('info', t('copyToClipboard:seedCleared'), t('copyToClipboard:seedClearedExplanation'));
    }

    onDonePress() {
        const { t, onboardingComplete, seed, password, shouldPreventAction } = this.props;
        const trimmedAccountName = trim(this.state.accountName);

        const fetch = (accountName) => {
            this.props.setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: accountName,
            });

            this.navigateTo('loading');
        };

        if (!isEmpty(this.state.accountName)) {
            if (!onboardingComplete) {
                this.props.setAccountName(trimmedAccountName);

                this.navigateTo('setPassword');
            } else {
                if (shouldPreventAction) {
                    return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
                }
                getAllSeedsFromKeychain(password)
                    .then((seedInfo) => {
                        if (isEmpty(seedInfo)) {
                            return fetch(trimmedAccountName);
                        }
                        if (hasDuplicateAccountName(seedInfo, trimmedAccountName)) {
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
                        return fetch(trimmedAccountName);
                    })
                    .catch(() => {
                        this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongExplanation'),
                        );
                    });
            }
        } else {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        }
    }

    onBackPress() {
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

    getDefaultAccountName() {
        const { t, seedCount } = this.props;
        if (seedCount === 0) {
            return t('global:mainWallet');
        } else if (seedCount === 1) {
            return t('global:secondWallet');
        } else if (seedCount === 2) {
            return t('global:thirdWallet');
        } else if (seedCount === 3) {
            return t('global:fourthWallet');
        } else if (seedCount === 4) {
            return t('global:fifthWallet');
        } else if (seedCount === 5) {
            return t('global:sixthWallet');
        } else if (seedCount === 6) {
            return t('global:otherWallet');
        }
        return '';
    }

    navigateTo(screen) {
        const { theme: { body } } = this.props;

        if (screen === 'loading') {
            return this.props.navigator.push({
                screen,
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
                overrideBackPress: true,
            });
        }
        return this.props.navigator.push({
            screen,
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

    render() {
        const { accountName } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.5 }} />
                            <CustomTextInput
                                label={t('addAdditionalSeed:accountName')}
                                onChangeText={(text) => this.setState({ accountName: text })}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize="words"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.onDonePress()}
                                theme={theme}
                                value={accountName}
                            />
                            <View style={{ flex: 0.3 }} />
                            <InfoBox
                                body={theme.body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, textColor]}>{t('canUseMultipleSeeds')}</Text>
                                        <Text style={[styles.infoText, textColor]}>{t('youCanAdd')}</Text>
                                    </View>
                                }
                            />
                            <View style={{ flex: 0.5 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:doneLowercase')}
                                leftButtonTestID="setSeedName-back"
                                rightButtonTestID="setSeedName-done"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    seedCount: state.accounts.seedCount,
    onboardingComplete: state.accounts.onboardingComplete,
    theme: state.settings.theme,
    shouldPreventAction: shouldPreventAction(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    setAccountName,
    generateAlert,
    setAdditionalAccountInfo,
};

export default translate(['setSeedName', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetAccountName),
);
