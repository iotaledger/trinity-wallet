import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { setOnboardingComplete } from 'shared-modules/actions/accounts';
import { clearWalletData, clearSeed, setPassword } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import SeedStore from 'libs/SeedStore';
import { storeSaltInKeychain } from 'libs/keychain';
import { generatePasswordHash, getSalt } from 'libs/crypto';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { isAndroid } from 'libs/device';
import { width, height } from 'libs/dimensions';
import InfoBox from 'ui/components/InfoBox';
import { Icon } from 'ui/theme/icons';
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
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
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
        clearSeed: PropTypes.func.isRequired,
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
     * Stores seed in keychain and clears seed from state
     * @method onAcceptPassword
     * @returns {Promise<void>}
     */
    async onAcceptPassword() {
        const { t, seed, accountName } = this.props;

        const salt = await getSalt();
        const pwdHash = await generatePasswordHash(this.state.password, salt);

        await storeSaltInKeychain(salt);
        this.props.setPassword(pwdHash);

        const seedStore = new SeedStore.keychain(pwdHash);

        const isUniqueSeed = await seedStore.isUniqueSeed(seed);
        if (!isUniqueSeed) {
            return this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedInUse'),
                t('addAdditionalSeed:seedInUseExplanation'),
            );
        }

        await seedStore.addAccount(accountName, seed);

        this.props.clearWalletData();
        this.props.clearSeed();
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
        Navigation.pop(this.props.componentId);
    }

    navigateToOnboardingComplete() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'onboardingComplete',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
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

    render() {
        const { t, theme: { body } } = this.props;
        const { password, reentry } = this.state;

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback style={{ flex: 1, width }} onPress={Keyboard.dismiss} accessible={false}>
                    <View style={[styles.container, { backgroundColor: body.bg }]}>
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={body.color}>{t('choosePassword')}</Header>
                        </View>
                        <KeyboardAvoidingView behavior={isAndroid ? null : 'padding'} style={styles.midContainer}>
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
                        </KeyboardAvoidingView>
                        <View style={styles.bottomContainer}>
                            <DualFooterButtons
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
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    accountName: state.wallet.additionalAccountName,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setOnboardingComplete,
    clearWalletData,
    clearSeed,
    setPassword,
    generateAlert,
};

export default withNamespaces(['setPassword', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword),
);
