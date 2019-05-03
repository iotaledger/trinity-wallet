import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import { getAnimation } from 'shared-modules/animations';
import LottieView from 'lottie-react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import Header from 'ui/components/Header';
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
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.7,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: Styling.fontSize4 * 1.5,
        paddingTop: height / 35,
    },
    animation: {
        width: width / 1.35,
        height: width / 1.35,
    },
});

/** Onboarding Complete screen componenet */
class OnboardingComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('OnboardingComplete');
    }

    onNextPress() {
        navigator.setStackRoot('loading');
    }

    render() {
        const {
            t,
            theme: { body, primary },
            themeName,
        } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('congratulations')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={200}
                        style={styles.animation}
                    >
                        <LottieView
                            source={getAnimation('onboardingComplete', themeName)}
                            loop
                            autoPlay
                            style={styles.animation}
                        />
                        <Text style={[styles.infoText, { color: body.color }]}>{t('walletReady')}</Text>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent
                        delay={0}
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                    >
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
    themeName: state.settings.themeName,
});

export default withNamespaces(['onboardingComplete', 'global'])(connect(mapStateToProps)(OnboardingComplete));
