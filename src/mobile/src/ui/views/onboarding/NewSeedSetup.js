import split from 'lodash/split';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, BackHandler, TouchableOpacity } from 'react-native';
import timer from 'react-native-timer';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import { clearSeed } from 'shared-modules/actions/wallet';
import { setOnboardingSeed, toggleModalActivity } from 'shared-modules/actions/ui';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { generateSecureRandom } from 'react-native-securerandom';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateNewSeed, randomiseSeedCharacter } from 'shared-modules/libs/crypto';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import FlagSecure from 'react-native-flag-secure-android';
import WithUserActivity from 'ui/components/UserActivity';
import CtaButton from 'ui/components/CtaButton';
import { width, height } from 'libs/dimensions';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import Header from 'ui/components/Header';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 5.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontSize: Styling.fontSize3,
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
        height: height / 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/** New Seed Setup component */
class NewSeedSetup extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
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
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        console.disableYellowBox = true; // eslint-disable-line no-console
        this.state = {
            randomised: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NewSeedSetup');
        if (this.props.onboardingComplete) {
            BackHandler.addEventListener('newSeedSetupBackPress', () => {
                this.setState({ randomised: false });
                this.onBackPress();
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
        timer.clearTimeout('newSeedSetup');
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
            navigator.push('saveYourSeed', {
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
                    title: {
                        color: body.color,
                    },
                },
                statusBar: {
                    backgroundColor: body.bg,
                },
            });
        } else {
            this.props.generateAlert('error', t('seedNotGenerated'), t('seedNotGeneratedExplanation'));
        }
    }

    onBackPress() {
        this.props.clearSeed();
        navigator.pop(this.props.componentId);
    }

    openModal() {
        const { theme } = this.props;
        this.props.toggleModalActivity('seedInfo', {
            theme,
            hideModal: () => this.props.toggleModalActivity(),
        });
    }

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
        const viewOpacity = this.state.randomised ? 1 : 0.2;
        const opacity = this.state.randomised ? 1 : 0.4;
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                {!minimised && (
                    <View>
                        <View style={styles.topContainer}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={400}
                            >
                                <Header textColor={body.color} />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.midContainer}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={300}
                            >
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
                            </AnimatedComponent>
                            <TouchableOpacity
                                onPress={() => this.openModal()}
                                style={{ marginTop: height / 65, marginBottom: height / 80 }}
                            >
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={200}
                                    style={styles.info}
                                >
                                    <Icon
                                        name="info"
                                        size={width / 22}
                                        color={body.color}
                                        style={{ marginRight: width / 60 }}
                                    />
                                    <Text style={[styles.infoText, textColor]}>{t('whatIsASeed')}</Text>
                                </AnimatedComponent>
                            </TouchableOpacity>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={100}
                            >
                                <FlatList
                                    contentContainerStyle={[styles.list, { opacity: viewOpacity }]}
                                    data={split(seed, '')}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => this.renderChequerboard(item, index)}
                                    initialNumToRender={MAX_SEED_LENGTH}
                                    scrollEnabled={false}
                                />
                            </AnimatedComponent>
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                                <DualFooterButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onNextPress()}
                                    leftButtonText={t('global:goBack')}
                                    rightButtonText={t('saveYourSeed:saveYourSeed')}
                                    leftButtonTestID="newSeedSetup-back"
                                    rightButtonTestID="newSeedSetup-next"
                                    rightButtonStyle={{ wrapper: { opacity } }}
                                />
                            </AnimatedComponent>
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: getThemeFromState(state),
    onboardingComplete: state.accounts.onboardingComplete,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    setOnboardingSeed,
    clearSeed,
    generateAlert,
    toggleModalActivity,
};

export default WithUserActivity()(
    withNamespaces(['newSeedSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup)),
);
