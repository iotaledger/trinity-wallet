import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { getAnimation } from 'shared-modules/animations';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { Styling } from 'ui/theme/general';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { height, width } from 'libs/dimensions';
import navigator from 'libs/navigation';
import CtaButton from 'ui/components/CtaButton';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.5,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    animation: {
        width: width / 1.85,
        height: width / 1.85,
    },
    text: {
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'center',
        width: Styling.contentWidth,
        fontSize: Styling.fontSize6,
        alignItems: 'center',
    },
});

/** Require login view screen partial for history screen */
class RequireLoginView extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    render() {
        const { t, theme, themeName } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={400}
                    >
                        <Text style={[styles.text, { color: theme.body.color }]}>
                            {t('moonpay:loginToViewPurchaseHistory')}
                        </Text>
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={200}
                        style={styles.animation}
                    >
                        <LottieView
                            source={getAnimation('language', themeName)}
                            style={styles.animation}
                            loop={false}
                            autoPlay
                            ref={(ref) => {
                                this.animation = ref;
                            }}
                            onAnimationFinish={() => this.animation.play(52, 431)}
                        />
                    </AnimatedComponent>
                </View>
                <View style={{ flex: 0.3 }} />
                <View style={styles.bottomContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={0}
                    >
                        <CtaButton
                            ctaColor={theme.primary.color}
                            ctaBorderColor={theme.primary.color}
                            secondaryCtaColor={theme.primary.body}
                            text={t('moonpay:loginToMoonPay')}
                            onPress={() => navigator.push('landing')}
                            ctaWidth={width / 1.4}
                            ctaHeight={height / 12}
                            displayActivityIndicator={false}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    forceUpdate: state.wallet.forceUpdate,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setSetting,
};

export default withTranslation(['languageSetup', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(RequireLoginView),
);
