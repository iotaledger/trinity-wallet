import split from 'lodash/split';
import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, BackHandler, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { randomiseSeed, setSeed, clearSeed } from 'iota-wallet-shared-modules/actions/wallet';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { Navigation } from 'react-native-navigation';
import Modal from 'react-native-modal';
import CtaButton from '../components/CtaButton';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/DynamicStatusBar';
import InfoBox from '../components/InfoBox';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';

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
        paddingBottom: height / 20,
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
    },
    generateButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 2.2,
        height: height / 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
    },
    generateText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 27.6,
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
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    okButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

/** New Seed Setup component */
class NewSeedSetup extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Set seed in reducer
         * @param {string} seed
         */
        setSeed: PropTypes.func.isRequired,
        /** Randomise seed
         * @param {function} generateSecureRandom
         */
        randomiseSeed: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Determines whether onboarding steps for wallet setup are completed */
        onboardingComplete: PropTypes.bool.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Wipes seed from reducer */
        clearSeed: PropTypes.func.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
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
        if (this.props.onboardingComplete) {
            BackHandler.addEventListener('newSeedSetupBackPress', () => {
                this.goBack();
                return true;
            });
        }
    }

    componentWillUnmount() {
        if (this.props.onboardingComplete) {
            BackHandler.removeEventListener('newSeedSetupBackPress');
        }
    }

    onGeneratePress() {
        const { t } = this.props;
        this.props.randomiseSeed(generateSecureRandom);
        this.setState({ randomised: true });
        this.props.generateAlert('success', t('generateSuccess'), t('individualLetters'));
    }

    onNextPress() {
        const { t, theme: { body } } = this.props;

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
            // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
            this.goBack();
        }
    }

    onItemPress(sectionID) {
        if (this.state.randomised) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
            generateSecureRandom(5).then((bytes) => {
                let i = 0;
                let seed = this.props.seed;
                Object.keys(bytes).forEach((key) => {
                    if (bytes[key] < 243 && i < 1) {
                        const randomNumber = bytes[key] % 27;
                        const randomLetter = charset.charAt(randomNumber);
                        const substr1 = seed.substr(0, sectionID);
                        sectionID++;
                        const substr2 = seed.substr(sectionID, 80);
                        seed = substr1 + randomLetter + substr2;
                        i++;
                    }
                });
                this.props.setSeed(seed);
            });
        }
    }

    goBack() {
        const { theme: { body } } = this.props;
        // TODO: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
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
                    width={width / 1.3}
                    text={
                        <View>
                            <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                {t('walletSetup:seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                            </Text>
                            <Trans i18nKey="walletSetup:explanation">
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 60 }]}>
                                    <Text style={styles.infoTextLight}>You can use it to access your funds from</Text>
                                    <Text style={styles.infoTextRegular}> any wallet</Text>
                                    <Text style={styles.infoTextLight}>, on</Text>
                                    <Text style={styles.infoTextRegular}> any device</Text>
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
                onPress={() => this.onItemPress(index)}
                style={[styles.tileContainer, { backgroundColor: input.bg }]}
                underlayColor={primary.color}
                hitSlop={{ top: height / 80, bottom: height / 80, left: height / 80, right: height / 80 }}
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
        const { seed, t, theme: { primary, body } } = this.props;
        const { isModalActive } = this.state;
        const viewOpacity = this.state.randomised ? 1 : 0.2;
        const opacity = this.state.randomised ? 1 : 0.1;
        const textColor = { color: body.color };
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <View style={{ flex: 1 }} />
                    <CtaButton
                        ctaColor={primary.color}
                        ctaBorderColor={primary.hover}
                        secondaryCtaColor={primary.body}
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
                        leftText={t('global:back')}
                        rightText={t('global:next')}
                        leftButtonTestID="newSeedSetup-back"
                        rightButtonTestID="newSeedSetup-next"
                        opacity={opacity}
                    />
                </View>
                <Modal
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', margin: 0 }}
                    isVisible={isModalActive}
                    onBackButtonPress={() => this.hideModal()}
                    hideModalContentWhileAnimating
                    useNativeDriver={isAndroid ? true : false}
                >
                    {this.renderModalContent()}
                </Modal>
                {!isModalActive && <StatefulDropdownAlert backgroundColor={body.bg} />}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    onboardingComplete: state.accounts.onboardingComplete,
});

const mapDispatchToProps = {
    setSeed,
    clearSeed,
    randomiseSeed,
    generateAlert,
};

export default translate(['newSeedSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup));
