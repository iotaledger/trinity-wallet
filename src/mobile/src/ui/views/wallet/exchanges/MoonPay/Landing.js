import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { fetchCountries, fetchCurrencies } from 'shared-modules/actions/exchanges/MoonPay';
import { getAnimation } from 'shared-modules/animations';
import navigator from 'libs/navigation';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';

const styles = StyleSheet.create({
    animation: {
        width: width / 2.4,
        height: width / 2.4,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.1,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

/** MoonPay landing screen component */
class Landing extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        fetchCountries: PropTypes.func.isRequired,
        /** @ignore */
        fetchCurrencies: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.props.fetchCountries();
        this.props.fetchCurrencies();
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    render() {
        const {
            t,
            theme: { body },
            themeName,
        } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header iconSize={width / 3} iconName="moonpay" textColor={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.2 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={266}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:buyIOTAInstantly')}</Text>
                            <AnimatedComponent
                                animationInType={['fadeIn', 'slideInRight']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={266}
                                style={styles.animation}
                            >
                                <LottieView
                                    source={getAnimation('sending', themeName)}
                                    style={styles.animation}
                                    loop={false}
                                    autoPlay
                                    ref={(ref) => {
                                        this.animation = ref;
                                    }}
                                    onAnimationFinish={() => this.animation.play(161, 395)}
                                />
                            </AnimatedComponent>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                {t('moonpay:supportExplanation')}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <AnimatedComponent
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={133}
                    >
                        <Text style={[styles.infoTextRegular, textColor, { textDecorationLine: 'underline' }]}>
                            {t('moonpay:termsAndConditionsApply')}
                        </Text>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => this.redirectToScreen('setupEmail')}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:continue')}
                            leftButtonTestID="moonpay-back-to-home"
                            rightButtonTestID="moonpay-add-amount"
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

const mapDispatchToProps = {
    fetchCountries,
    fetchCurrencies,
};

export default withTranslation()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Landing),
);
