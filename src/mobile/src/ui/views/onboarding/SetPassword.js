import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import { setOnboardingComplete } from 'shared-modules/actions/accounts';
import { clearWalletData } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SeedStore from 'libs/SeedStore';
import { storeSaltInKeychain } from 'libs/keychain';
import { generatePasswordHash, getSalt } from 'libs/crypto';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
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
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.6,
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
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
});

/** Set Password component */
class SetPassword extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            password: null,
            reentry: null,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SetPassword');
    }

    componentWillUnmount() {
        delete this.state.password;
        delete this.state.reentry;
    }

    /**
     * Stores seed in keychain and clears seed from state
     * @method onAcceptPassword
     * @returns {Promise<void>}
     */
    async onAcceptPassword() {
        const { t, accountName } = this.props;
        const salt = await getSalt();
        global.passwordHash = await generatePasswordHash(this.state.password, salt);
        delete this.state.password;
        await storeSaltInKeychain(salt);

        const seedStore = await new SeedStore.keychain(global.passwordHash);
        const isUniqueSeed = await seedStore.isUniqueSeed(global.onboardingSeed);
        if (!isUniqueSeed) {
            return this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedInUse'),
                t('addAdditionalSeed:seedInUseExplanation'),
            );
        }
        await seedStore.addAccount(accountName, global.onboardingSeed);
        delete global.onboardingSeed;
        this.props.clearWalletData();
        this.props.setOnboardingComplete(true);
        this.navigateToOnboardingComplete();
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
        navigator.pop(this.props.componentId);
    }

    navigateToOnboardingComplete() {
        navigator.push('onboardingComplete');
    }

    render() {
        const { t, theme: { body } } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: body.bg }]}>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header textColor={body.color}>{t('choosePassword')}</Header>
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={266}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: body.color }]}>{t('anEncryptedCopy')}</Text>
                                <Text style={[styles.warningText, { color: body.color }]}>
                                    {t('changePassword:ensureStrongPassword')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.2 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={266}
                        >
                            <PasswordFields
                                onRef={(ref) => {
                                    this.passwordFields = ref;
                                }}
                                onAcceptPassword={() => this.onAcceptPassword()}
                                password={this.state.password}
                                reentry={this.state.reentry}
                                setPassword={(password) => {
                                    this.setState({ password });
                                }}
                                setReentry={(reentry) => {
                                    this.setState({ reentry });
                                }}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.35 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:done')}
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: state.accounts.accountInfoDuringSetup.name,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setOnboardingComplete,
    clearWalletData,
    generateAlert,
};

export default withNamespaces(['setPassword', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword),
);
