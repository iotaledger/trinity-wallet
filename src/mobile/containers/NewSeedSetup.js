import split from 'lodash/split';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { randomiseSeed, setSeed, clearSeed } from 'iota-wallet-shared-modules/actions/wallet';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { Navigation } from 'react-native-navigation';
import CtaButton from '../components/CtaButton';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';

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
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 40,
        paddingBottom: width / 40,
    },
    tileText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 28.9,
        textAlign: 'center',
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
            infoTextColor: 'transparent',
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
        const { theme: { body } } = this.props;
        this.props.randomiseSeed(generateSecureRandom);
        this.setState({ randomised: true, infoTextColor: body.color });
    }

    onNextPress() {
        const { t, theme: { body } } = this.props;

        if (this.state.randomised) {
            this.props.navigator.push({
                screen: 'saveYourSeed',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    drawUnderStatusBar: true,
                    screenBackgroundColor: body.bg,
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
                    navBarTransparent: true,
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
                    screenBackgroundColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

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
        const viewOpacity = this.state.randomised ? 1 : 0.2;
        const opacity = this.state.randomised ? 1 : 0.1;

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
                    <View style={{ flex: 15 }} />
                    <FlatList
                        contentContainerStyle={[styles.list, { opacity: viewOpacity }]}
                        data={split(seed, '')}
                        keyExtractor={(item, index) => index}
                        renderItem={({ item, index }) => this.renderChequerboard(item, index)}
                        initialNumToRender={MAX_SEED_LENGTH}
                        scrollEnabled={false}
                    />
                    <View style={styles.infoTextContainer}>
                        <Text
                            style={{
                                color: this.state.infoTextColor,
                                fontFamily: 'Lato-Light',
                                textAlign: 'center',
                                fontSize: width / 27.6,
                                backgroundColor: 'transparent',
                            }}
                        >
                            {t('individualLetters')}
                        </Text>
                    </View>
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
                <StatefulDropdownAlert backgroundColor={body.bg} />
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
