import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback, Clipboard } from 'react-native';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setAccountName, setAdditionalAccountInfo } from 'shared-modules/actions/wallet';
import { connect } from 'react-redux';
import { shouldPreventAction } from 'shared-modules/selectors/global';
import { VALID_SEED_REGEX } from 'shared-modules/libs/iota/utils';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import CustomTextInput from 'ui/components/CustomTextInput';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import { width, height } from 'libs/dimensions';
import { hasDuplicateAccountName, hasDuplicateSeed, getAllSeedsFromKeychain } from 'libs/keychain';
import InfoBox from 'ui/components/InfoBox';
import { Icon } from 'ui/theme/icons';
import GENERAL from 'ui/theme/general';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

console.ignoredYellowBox = true;

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
        justifyContent: 'flex-start',
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
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
});

/** Set Account Name component */
export class SetAccountName extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        setAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        onboardingComplete: PropTypes.bool.isRequired,
        /** @ignore */
        seedCount: PropTypes.number.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** Determines whether to prevent new account setup */
        shouldPreventAction: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: this.getDefaultAccountName(),
        };
    }

    async componentDidMount() {
        leaveNavigationBreadcrumb('SetAccountName');
        const { t } = this.props;
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent.match(VALID_SEED_REGEX)) {
            Clipboard.setString(' ');
            this.props.generateAlert(
                'info',
                t('copyToClipboard:seedCleared'),
                t('copyToClipboard:seedClearedExplanation'),
            );
        }
    }

    /**
     * Navigates to loading screen and fetches seed information from the Tangle
     * @method onDonePress
     */
    onDonePress() {
        const { t, onboardingComplete, seed, password, shouldPreventAction } = this.props;
        const trimmedAccountName = trim(this.state.accountName);

        const fetch = (accountName) => {
            this.props.setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: accountName,
                usedExistingSeed: false,
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

    /**
     * Pops the active screen from the navigation stack
     * @method onBackPress
     */
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

    /**
     * Gets a default account name
     *
     * @method getDefaultAccountName
     * @returns {*}
     */
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

    /**
     * Navigates to the provided screen name
     * @method navigateTo
     * @param {string} screen
     */
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
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={theme.body.color}>{t('letsAddName')}</Header>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.15 }} />
                            <CustomTextInput
                                label={t('addAdditionalSeed:accountName')}
                                onChangeText={(text) => this.setState({ accountName: text })}
                                containerStyle={{ width: width / 1.15 }}
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
                                rightButtonText={t('global:done')}
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
