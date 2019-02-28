import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback, Clipboard } from 'react-native';
import { navigator } from 'libs/navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setAccountInfoDuringSetup } from 'shared-modules/actions/accounts';
import { connect } from 'react-redux';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { getAccountNamesFromState } from 'shared-modules/selectors/accounts';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import CustomTextInput from 'ui/components/CustomTextInput';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width } from 'libs/dimensions';
import SeedStore from 'libs/SeedStore';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.6,
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
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Set Account Name component */
export class SetAccountName extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        onboardingComplete: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines whether to prevent new account setup */
        shouldPreventAction: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            accountName: '',
        };
    }

    async componentDidMount() {
        leaveNavigationBreadcrumb('SetAccountName');
        const { t } = this.props;
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent.match(VALID_SEED_REGEX) && clipboardContent.length === MAX_SEED_LENGTH) {
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
    async onDonePress() {
        const { t, onboardingComplete, accountNames, shouldPreventAction } = this.props;
        const accountName = trim(this.state.accountName);

        if (shouldPreventAction) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        if (isEmpty(accountName)) {
            return this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        }

        if (accountNames.map((item) => item.toLowerCase()).indexOf(accountName.toLowerCase()) > -1) {
            return this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        }

        if (onboardingComplete) {
            const seedStore = await new SeedStore.keychain(global.passwordHash);
            const isSeedUnique = await seedStore.isUniqueSeed(global.onboardingSeed);
            if (!isSeedUnique) {
                return this.props.generateAlert(
                    'error',
                    t('addAdditionalSeed:seedInUse'),
                    t('addAdditionalSeed:seedInUseExplanation'),
                );
            }
        }

        this.props.setAccountInfoDuringSetup({
            name: accountName,
            meta: { type: 'keychain' },
            completed: true,
        });

        if (onboardingComplete) {
            const seedStore = await new SeedStore.keychain(global.passwordHash);
            seedStore.addAccount(accountName, global.onboardingSeed);
            this.navigateTo('loading');
        } else {
            this.navigateTo('setPassword');
        }
    }

    /**
     * Pops the active screen from the navigation stack
     * @method onBackPress
     */
    onBackPress() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Navigates to the provided screen name
     * @method navigateTo
     * @param {string} screen
     */
    navigateTo(screen) {
        navigator.push(screen);
    }

    render() {
        const { accountName } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <View style={styles.topContainer}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={400}
                            >
                                <Header textColor={theme.body.color}>{t('letsAddName')}</Header>
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midContainer}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={266}
                            >
                                <InfoBox>
                                    <Text style={[styles.infoText, textColor]}>{t('canUseMultipleSeeds')}</Text>
                                    <Text style={[styles.infoText, textColor]}>{t('youCanAdd')}</Text>
                                </InfoBox>
                            </AnimatedComponent>
                            <View style={{ flex: 0.3 }} />
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={133}
                            >
                                <CustomTextInput
                                    label={t('addAdditionalSeed:accountName')}
                                    onValidTextChange={(text) => this.setState({ accountName: text })}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={() => this.onDonePress()}
                                    theme={theme}
                                    value={accountName}
                                />
                            </AnimatedComponent>
                            <View style={{ flex: 0.55 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                                <DualFooterButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftButtonText={t('global:goBack')}
                                    rightButtonText={t('global:done')}
                                    leftButtonTestID="setSeedName-back"
                                    rightButtonTestID="setSeedName-done"
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
    accountNames: getAccountNamesFromState(state),
    onboardingComplete: state.accounts.onboardingComplete,
    theme: getThemeFromState(state),
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    generateAlert,
    setAccountInfoDuringSetup,
};

export default withNamespaces(['setSeedName', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetAccountName),
);
