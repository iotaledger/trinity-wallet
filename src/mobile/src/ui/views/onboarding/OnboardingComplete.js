import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import balloonsAnimation from 'shared-modules/animations/balloons-white.json';
import LottieView from 'lottie-react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoTextContainer: {
        paddingHorizontal: width / 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height / 6,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: height / 30,
    },
});

/** Onboarding Complete screen componenet */
class OnboardingComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('OnboardingComplete');
    }

    onNextPress() {
        navigator.setStackRoot('loading');
    }

    render() {
        const { t, theme: { body, primary } } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={400}>
                        <Icon name="iota" size={width / 8} color={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut']}
                        delay={200}
                        style={styles.infoTextContainer}
                    >
                        <Text style={[styles.infoText, { color: body.color }]}>{t('walletReady')}</Text>
                    </AnimatedComponent>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut']}
                        delay={0}
                        style={{ height, width, opacity: 0.04 }}
                    >
                        <LottieView
                            ref={(animation) => {
                                this.animation = animation;
                            }}
                            source={balloonsAnimation}
                            loop={false}
                            autoPlay
                        />
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <SingleFooterButton
                            onButtonPress={() => this.onNextPress()}
                            testID="languageSetup-next"
                            buttonStyle={{
                                wrapper: { backgroundColor: primary.color },
                                children: { color: primary.body },
                            }}
                            buttonText={t('openYourWallet')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default withNamespaces(['onboardingComplete', 'global'])(connect(mapStateToProps)(OnboardingComplete));
