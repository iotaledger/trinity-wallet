import split from 'lodash/split';
import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, BackHandler, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { clearSeed } from 'shared/actions/wallet';
import { setOnboardingSeed } from 'shared/actions/ui';
import { MAX_SEED_LENGTH } from 'shared/libs/iota/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { generateAlert } from 'shared/actions/alerts';
import { generateNewSeed, randomiseSeedCharacter } from 'shared/libs/crypto';
import Modal from 'react-native-modal';
import FlagSecure from 'react-native-flag-secure-android';
import WithUserActivity from 'ui/components/UserActivity';
import CtaButton from 'ui/components/CtaButton';
import { width, height } from 'libs/dimensions';
import OnboardingButtons from 'ui/components/OnboardingButtons';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import GENERAL from 'ui/theme/general';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';
import InfoBox from 'ui/components/InfoBox';
import { Icon } from 'ui/theme/icons.js';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.75,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 5.65,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.6,
        justifyContent: 'flex-end',
    },
    list: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: width / 20,
    },
    tile: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tileContainer: {
        width: width / 14.5,
        height: width / 14.5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: width / 80,
        borderWidth: 1,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'left',
    },
    tileText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 28.9,
        textAlign: 'center',
    },
    info: {
        height: height / 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    okButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

/** New Seed Setup component */
class NewSeedSetup extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        onboardingComplete: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        clearSeed: PropTypes.func.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        console.disableYellowBox = true; // eslint-disable-line no-console

        this.state = {
            randomised: false,
            isModalActive: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NewSeedSetup');
        if (this.props.onboardingComplete) {
            BackHandler.addEventListener('newSeedSetupBackPress', () => {
                this.goBack();
                return true;
            });
        }
        if (isAndroid) {
            FlagSecure.activate();
        }
    }

    componentWillUnmount() {
        if (this.props.onboardingComplete) {
            BackHandler.removeEventListener('newSeedSetupBackPress');
        }
        if (isAndroid) {
            FlagSecure.deactivate();
        }
    }

    async onGeneratePress() {
        const { t } = this.props;
        const seed = await generateNewSeed(generateSecureRandom);
        this.props.setOnboardingSeed(seed, true);
        this.setState({ randomised: true });
        this.props.generateAlert('success', t('generateSuccess'), t('individualLetters'));
    }

    async onCharPress(sectionID) {
        const { seed } = this.props;
        const { randomised } = this.state;
        if (randomised) {
            const updatedSeed = await randomiseSeedCharacter(seed, sectionID, generateSecureRandom);
            this.props.setOnboardingSeed(updatedSeed, true);
        }
    }

    onNextPress() {
        const { t, theme: { body } } = this.props;
        if (isAndroid) {
            FlagSecure.deactivate();
        }
        if (this.state.randomised) {
            this.props.navigator.push({
                screen: 'saveYourSeed',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                    navBarButtonColor: isAndroid ? body.bg : 'black',
                },
                animated: false,
            });
        } else {
            this.props.generateAlert('error', t('seedNotGenerated'), t('seedNotGeneratedExplanation'));
        }
    }

    onBackPress() {
        const { theme: { body } } = this.props;
        this.props.clearSeed();
        if (!this.props.onboardingComplete) {
            this.props.navigator.pop({
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTranslucent: true,
                    navBarTransparent: true,
                    navBarBackgroundColor: 'transparent',
                    topBarElevationShadowEnabled: false,
                    navBarNoBorder: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
            });
        } else {
            this.goBack();
        }
    }

    goBack() {
        const { theme: { body, bar } } = this.props;
        this.props.navigator.resetTo({
            screen: 'home',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: bar.alt,
            },
            animated: false,
        });
    }

    openModal() {
        this.setState({ isModalActive: true });
    }

    hideModal() {
        this.setState({ isModalActive: false });
    }

    renderModalContent = () => {
        const { t, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={{ backgroundColor: body.bg }}>
                <InfoBox
                    body={body}
                    width={width / 1.15}
                    text={
                        <View>
                            <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                                {t('walletSetup:seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                            </Text>
                            <Trans i18nKey="walletSetup:explanation">
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 60 }]}>
                                    <Text style={styles.infoTextLight}>You can use it to access your funds from</Text>
                                    <Text style={styles.infoTextBold}> any wallet</Text>
                                    <Text style={styles.infoTextLight}>, on</Text>
                                    <Text style={styles.infoTextBold}> any device</Text>
                                    <Text style={styles.infoTextLight}>
                                        . But if you lose your seed, you also lose your IOTA.
                                    </Text>
                                </Text>
                            </Trans>
                            <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.hideModal()}>
                                    <View style={[styles.okButton, { borderColor: primary.color }]}>
                                        <Text style={[styles.okText, { color: primary.color }]}>
                                            {t('global:okay')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />
            </View>
        );
    };

    renderChequerboard(character, index) {
        const { theme: { input, primary } } = this.props;

        const { randomised } = this.state;

        return (
            <TouchableHighlight
                onPress={() => this.onCharPress(index)}
                style={[styles.tileContainer, { backgroundColor: input.bg, borderColor: primary.border }]}
                underlayColor={primary.color}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
                <View style={styles.tile}>
                    <Text style={[styles.tileText, { color: input.color, opacity: randomised ? 1 : 0.1 }]}>
                        {character}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    render() {
        const { t, theme: { primary, secondary, body }, seed, minimised } = this.props;
        const { isModalActive } = this.state;
        const viewOpacity = this.state.randomised ? 1 : 0.2;
        const opacity = this.state.randomised ? 1 : 0.4;
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                {!minimised && (
                    <View>
                        <DynamicStatusBar backgroundColor={body.bg} />
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
                            <View style={{ flex: 1 }} />
                            <CtaButton
                                ctaColor={secondary.color}
                                ctaBorderColor={primary.hover}
                                secondaryCtaColor={secondary.body}
                                text={t('pressForNewSeed')}
                                onPress={() => {
                                    this.onGeneratePress();
                                }}
                                ctaWidth={width / 1.6}
                                testID="newSeedSetup-newSeed"
                            />
                        </View>
                        <View style={styles.midContainer}>
                            <TouchableOpacity
                                onPress={() => this.openModal()}
                                style={{ marginTop: height / 65, marginBottom: height / 80 }}
                            >
                                <View style={styles.info}>
                                    <Icon
                                        name="info"
                                        size={width / 22}
                                        color={body.color}
                                        style={{ marginRight: width / 60 }}
                                    />
                                    <Text style={[styles.infoText, textColor]}>{t('whatIsASeed')}</Text>
                                </View>
                            </TouchableOpacity>
                            <FlatList
                                contentContainerStyle={[styles.list, { opacity: viewOpacity }]}
                                data={split(seed, '')}
                                keyExtractor={(item, index) => index}
                                renderItem={({ item, index }) => this.renderChequerboard(item, index)}
                                initialNumToRender={MAX_SEED_LENGTH}
                                scrollEnabled={false}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onNextPress()}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('saveYourSeed:saveYourSeed')}
                                leftButtonTestID="newSeedSetup-back"
                                rightButtonTestID="newSeedSetup-next"
                                rightButtonStyle={{ wrapper: { opacity } }}
                            />
                        </View>
                        <Modal
                            backdropTransitionInTiming={isAndroid ? 500 : 300}
                            backdropTransitionOutTiming={200}
                            backdropColor={body.bg}
                            backdropOpacity={0.9}
                            style={styles.modal}
                            isVisible={isModalActive}
                            onBackButtonPress={() => this.hideModal()}
                            hideModalContentWhileAnimating
                            useNativeDriver={isAndroid}
                        >
                            {this.renderModalContent()}
                        </Modal>
                        {!isModalActive && <StatefulDropdownAlert backgroundColor={body.bg} />}
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    onboardingComplete: state.accounts.onboardingComplete,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    setOnboardingSeed,
    clearSeed,
    generateAlert,
};

export default WithUserActivity()(
    translate(['newSeedSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup)),
);
